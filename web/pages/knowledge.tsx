import React, { useLayoutEffect, useRef } from "react";
import type { NextPage } from "next";
import useComponentSize from "@rehooks/component-size";

import { gql } from "urql";
import { useQuery } from "urql";

import { select } from "d3-selection";
import { drag, D3DragEvent } from "d3-drag";

import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";

import { WithUrqlState } from "next-urql";
import { withClient } from "components/urql";

import { ChakraProviderProps } from "components/chakra";
import { getPageCookies } from "components/chakra";

import { Box } from "@chakra-ui/react";

import { KnowledgeQuery, KnowledgeQueryVariables } from "graphql-types";

const KNOWLEDGE_QUERY = gql`
  query Knowledge {
    knowledge {
      entries {
        id
        names
        links {
          incoming
          outgoing
        }
      }
    }
  }
`;

interface KnowledgePageProps extends WithUrqlState, ChakraProviderProps {}

const Knowledge: NextPage<KnowledgePageProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useComponentSize(containerRef);
  const svgRef = useRef<SVGSVGElement>(null);

  const [{ data }] = useQuery<KnowledgeQuery, KnowledgeQueryVariables>({
    query: KNOWLEDGE_QUERY,
  });
  const { entries } = data?.knowledge ?? {};

  // Initialize graph.
  useLayoutEffect(
    () => {
      const svgEl = svgRef.current;
      console.log({ svgEl });
      if (svgEl && !svgEl.children.length && entries) {
        let isDragging = false;

        const nodesById: Record<
          string,
          {
            id: string;
            links: { incoming: string[]; outgoing: string[] };
            names: string[];
            radius: number;
          }
        > = {};
        const links: {
          source: string;
          target: string;
        }[] = [];

        {
          const nodeRadius = (
            entry?: KnowledgeQuery["knowledge"]["entries"][0],
          ): number => {
            const { incoming, outgoing } = entry?.links ?? {};
            return (
              (incoming && outgoing ? incoming.length + outgoing.length : 0) *
                0.25 +
              4
            );
          };

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const { __typename, ...entry } of entries) {
            nodesById[entry.id] = { ...entry, radius: nodeRadius(entry) };
          }

          for (const entry of entries) {
            for (const linkedEntryId of entry.links.outgoing) {
              links.push({
                source: entry.id,
                target: linkedEntryId,
              });
              if (!nodesById[linkedEntryId]) {
                nodesById[linkedEntryId] = {
                  id: linkedEntryId,
                  names: [linkedEntryId],
                  links: { incoming: [], outgoing: [] },
                  radius: nodeRadius(),
                };
              }
            }
          }
        }
        const nodes = Object.values(nodesById);

        const { width, height } = containerSize;
        const svg = select(svgEl).attr("viewBox", `0 0 ${width} ${height}`);

        const link = svg
          .selectAll(".link")
          .data(links)
          .join("line")
          .classed("link", true);

        const node = svg
          .selectAll(".node")
          .data(nodes)
          .join("g")
          .classed("node", true);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const nodeCircle = node
          .append("circle")
          .attr("r", d => d.radius)
          .on("mouseover", (event, d) => {
            if (!isDragging) {
              node.classed("focused", u => u.id === d.id);
              link.classed("focused", (l: any) => {
                return [l.source, l.target].includes(d);
              });
              node.classed(
                "faded",
                u =>
                  u.id !== d.id &&
                  !u.links.incoming.includes(d.id) &&
                  !u.links.outgoing.includes(d.id) &&
                  !d.links.incoming.includes(u.id) &&
                  !d.links.outgoing.includes(u.id),
              );
              link.classed(
                "faded",
                (l: any) => ![l.source, l.target].includes(d),
              );
            }
          })
          .on("mouseout", () => {
            if (!isDragging) {
              node.classed("focused", false);
              link.classed("focused", false);
              node.classed("faded", false);
              link.classed("faded", false);
            }
          });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const nodeLabel = node
          .append("text")
          .text(d => d.id)
          .attr("text-anchor", "middle")
          .attr("dy", d => d.radius + 12);

        const simulation = forceSimulation(nodes as any)
          .force(
            "link",
            forceLink(links)
              .id(d => (d as any).id)
              .strength(0.01),
          )
          .force(
            "collide",
            forceCollide(d => (d as any).radius)
              .strength(0.5)
              .iterations(1),
          )
          .force("charge", forceManyBody().strength(-50).distanceMax(200))
          .force("center", forceCenter(width / 2, height / 2))
          .on("tick", () => {
            node.attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
            link
              .attr("x1", (d: any) => d.source.x)
              .attr("y1", (d: any) => d.source.y)
              .attr("x2", (d: any) => d.target.x)
              .attr("y2", (d: any) => d.target.y);
          })
          .alpha(1)
          .restart();

        type DragEvent = D3DragEvent<HTMLElement, any, any>;
        node.call(
          drag()
            .on("start", ({ active, subject }: DragEvent) => {
              isDragging = true;
              if (!active) {
                simulation.alphaTarget(0.3).restart();
              }
              subject.isDragging = true;
              subject.fx = subject.x;
              subject.fy = subject.y;
            })
            .on("drag", ({ subject, x, y }: DragEvent) => {
              subject.fx = x;
              subject.fy = y;
            })
            .on("end", ({ active, subject }: DragEvent) => {
              isDragging = false;
              if (!active) {
                simulation.alphaTarget(0);
              }
              subject.isDragging = false;
              subject.fx = null;
              subject.fy = null;
            }) as any,
        );

        return () => {
          simulation.stop();
          select(svgEl).selectChildren().remove();
        };
      }
    },
    [entries], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        ".node": {
          transitionProperty: "fill-opacity",
          transitionTimingFunction: "ease-in-out",
          transitionDuration: "200ms",
        },
        ".node.faded": {
          fillOpacity: 0.15,
        },
        ".node circle": {
          cursor: "pointer",
          fill: "gray.700",
          transitionProperty: "fill",
          transitionTimingFunction: "ease-in-out",
          transitionDuration: "200ms",
        },
        ".node text": {
          pointerEvents: "none",
          fill: "gray.600",
          fontSize: "xs",
          transitionProperty: "fill",
          transitionTimingFunction: "ease-in-out",
          transitionDuration: "200ms",
        },
        ".node.focused circle": {
          fill: "purple.500",
        },
        ".node.focused text": {
          fill: "gray.800",
        },
        ".link": {
          stroke: "gray.300",
          strokeWidth: 1.5,
          strokeOpacity: 0.5,
          transitionProperty: "stroke-opacity",
          transitionTimingFunction: "ease-in-out",
          transitionDuration: "200ms",
        },
        ".link.focused": {
          stroke: "purple.300",
          strokeOpacity: 1,
        },
        ".link.faded": {
          strokeOpacity: 0.3,
        },
      }}
    >
      <svg ref={svgRef} style={{ width: "100vw", height: "100vh" }} />
    </Box>
  );
};

Knowledge.getInitialProps = ctx => {
  return {
    cookies: getPageCookies(ctx),
  };
};

export default withClient({ ssr: true })(Knowledge);
