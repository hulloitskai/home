import React, { FC, useLayoutEffect, useRef } from "react";
import useComponentSize from "@rehooks/component-size";

import { select } from "d3-selection";
import { drag, D3DragEvent } from "d3-drag";

import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";

import { BoxProps, Box } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";

import { gql } from "@apollo/client";
import type { KnowledgeGraphEntryFragment } from "apollo";

gql`
  fragment KnowledgeGraphEntry on KnowledgeEntry {
    id
    tags
    links {
      incoming {
        id
      }
      outgoing {
        id
      }
    }
  }
`;

export interface KnowledgeGraphProps extends BoxProps {
  entries: KnowledgeGraphEntryFragment[];
  highlightedEntryId?: string;
  linkForce?: number;
  bodyForce?: number;
  showOrphans?: boolean;
}

export const KnowledgeGraph: FC<KnowledgeGraphProps> = ({
  entries,
  highlightedEntryId,
  linkForce = 0.01,
  bodyForce = -50,
  showOrphans,
  ...otherProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useComponentSize(containerRef);
  const svgRef = useRef<SVGSVGElement>(null);
  const svgEl = svgRef.current;

  useLayoutEffect(
    () => {
      if (svgEl && !svgEl.children.length && entries) {
        let isDragging = false;

        const nodesById: Record<
          string,
          {
            id: string;
            tags: string[];
            links: { incoming: { id: string }[]; outgoing: { id: string }[] };
            radius: number;
          }
        > = {};
        const links: {
          source: string;
          target: string;
        }[] = [];

        {
          const nodeRadius = (entry?: KnowledgeGraphEntryFragment): number => {
            const { incoming, outgoing } = entry?.links ?? {};
            const radius =
              (incoming && outgoing ? incoming.length + outgoing.length : 0) *
                0.25 +
              4;
            if (highlightedEntryId && entry) {
              if (highlightedEntryId === entry.id && radius < 10) {
                return 12;
              }
            }
            return radius;
          };

          for (const entry of entries) {
            nodesById[entry.id] = {
              ...entry,
              radius: nodeRadius(entry),
            };
          }

          for (const entry of entries) {
            for (const linked of entry.links.outgoing) {
              if (!nodesById[linked.id] && showOrphans) {
                nodesById[linked.id] = {
                  id: linked.id,
                  tags: [],
                  links: { incoming: [], outgoing: [] },
                  radius: nodeRadius(),
                };
              }
              if (nodesById[linked.id]) {
                links.push({
                  source: entry.id,
                  target: linked.id,
                });
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
          .attr("class", d => ["node", ...d.tags].join(" "));

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const highlightedNode = highlightedEntryId
          ? node
              .filter(d => d.id === highlightedEntryId)
              .classed("highlighted", true)
          : undefined;

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
                  !u.links.incoming.find(({ id }) => id === d.id) &&
                  !u.links.outgoing.find(({ id }) => id === d.id) &&
                  !d.links.incoming.find(({ id }) => id === d.id) &&
                  !d.links.outgoing.find(({ id }) => id === d.id),
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
          .attr("dy", d => d.radius + 15);

        const simulation = forceSimulation(nodes as any)
          .force(
            "link",
            forceLink(links)
              .id(d => (d as any).id)
              .strength(linkForce),
          )
          .force(
            "collide",
            forceCollide(d => (d as any).radius)
              .strength(0.5)
              .iterations(1),
          )
          .force("charge", forceManyBody().strength(bodyForce).distanceMax(200))
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
    [svgEl, entries], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const nodeCircleFill = useColorModeValue("gray.700", "gray.300");
  const nodeCircleFocusedFill = useColorModeValue("purple.500", "purple.300");
  const nodeLabelFill = useColorModeValue("gray.600", "gray.400");
  const nodeLabelFocusedFill = useColorModeValue("gray.800", "gray.200");
  const linkStroke = useColorModeValue("gray.300", "gray.700");
  const linkFocusedOpacity = useColorModeValue(1, 0.5);

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
          fill: nodeCircleFill,
          transitionProperty: "fill",
          transitionTimingFunction: "ease-in-out",
          transitionDuration: "200ms",
        },
        ".node text": {
          pointerEvents: "none",
          fill: nodeLabelFill,
          fontSize: "xs",
          transitionProperty: "fill",
          transitionTimingFunction: "ease-in-out",
          transitionDuration: "200ms",
        },
        ".node.focused circle": {
          fill: nodeCircleFocusedFill,
        },
        ".node.focused text": {
          fill: nodeLabelFocusedFill,
        },
        ".node.highlighted:not(.focused) circle": {
          fill: "yellow.400",
        },
        ".node.person:not(.highlighted):not(.focused) circle": {
          fill: "rgb(233, 100, 166)",
        },
        ".node.day:not(.highlighted):not(.focused) circle": {
          fill: "rgb(123, 159, 216)",
        },
        ".node.week:not(.highlighted):not(.focused) circle": {
          fill: "rgb(65, 101, 210)",
        },
        ".node.month:not(.highlighted):not(.focused) circle": {
          fill: "rgb(16, 39, 113)",
        },
        ".link": {
          stroke: linkStroke,
          strokeWidth: 1.5,
          strokeOpacity: 0.5,
          transitionProperty: "stroke-opacity",
          transitionTimingFunction: "ease-in-out",
          transitionDuration: "200ms",
        },
        ".link.focused": {
          stroke: "purple.300",
          strokeOpacity: linkFocusedOpacity,
        },
        ".link.faded": {
          strokeOpacity: 0.3,
        },
      }}
      {...otherProps}
    >
      <svg
        ref={svgRef}
        style={{ width: containerSize.width, height: containerSize.height }}
      />
    </Box>
  );
};
