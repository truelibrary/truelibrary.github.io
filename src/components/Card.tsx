import {
  Blockquote,
  Card,
  Flex,
  Group,
  Popover,
  Skeleton,
  Text,
} from "@mantine/core";
import classes from "./Card.module.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PortableTextDocument } from "../types";
import { badges } from "../utils";
import Pill from "./Pill";
import PortableText from "react-portable-text";

type Props = {
  children: ReactNode;
};

type CardProps = {
  title: string;
  body: PortableTextDocument;
  tags?: string[];
  search?: string;
  onClick?: () => void;
};
export function ArticleCard({ title, body, tags, search, onClick }: CardProps) {
  const plainText = extractPlainText(body);
  const sentences = splitIntoSentences(plainText);
  const lowerSearch = search?.toLowerCase() || "";
  const matchingSentences = sentences.filter((s) =>
    s.toLowerCase().includes(lowerSearch)
  );

  const displayedSentences = matchingSentences
    .slice(0, 3)
    .map((s) => highlightText(s, search || ""));

  return (
    <Card
      withBorder
      padding="lg"
      radius="md"
      className={classes.card}
      onClick={onClick}
    >
      <Text className={classes.title}>{title}</Text>

      <Text fz="sm" mb="lg" c="dimmed" lineClamp={6}>
        {search ? (
          <div style={{ marginTop: 16 }}>
            {displayedSentences?.map((sentence, idx) => (
              <span key={idx}>{sentence} </span>
            ))}
          </div>
        ) : (
          <PortableText
            content={body}
            serializers={{
              h1: ({ children }: Props) => (
                <h1 style={{ fontSize: 16 }}>{children}</h1>
              ),
              h2: ({ children }: Props) => (
                <h2 style={{ fontSize: 14 }}>{children}</h2>
              ),
              h3: ({ children }: Props) => (
                <h3 style={{ fontSize: 12 }}>{children}</h3>
              ),
              h4: ({ children }: Props) => (
                <h4 style={{ fontSize: 10 }}>{children}</h4>
              ),
              blockquote: ({ children }: any) => (
                <Blockquote style={{ marginTop: 8, padding: 5 }}>
                  {children}
                </Blockquote>
              ),
              carousel: ({ slides }: any) => (
                <img
                  className={classes.card__img}
                  src={slides[0].asset.url}
                  alt=""
                />
              ),
              image: ({ asset, alt }: any) => {
                if (
                  body.length !== 1 &&
                  body.find((b) => b._type === "image")
                ) {
                  return;
                }
                return (
                  <img
                    src={asset?.url}
                    alt={alt || "Image"}
                    style={{
                      marginTop: 16,
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "8px",
                    }}
                  />
                );
              },
            }}
          />
        )}
      </Text>

      <Card.Section className={classes.footer} style={{ marginTop: "auto" }}>
        <Group gap={4}>
          <CardPills pills={badges.filter((b) => tags?.includes(b.value))} />
        </Group>
      </Card.Section>
    </Card>
  );
}

type CardPillsProps = {
  pills: { title: string; value: string }[];
};

export function CardPills({ pills }: CardPillsProps) {
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(pills.length);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const MAX_WIDTH = 260;

  useEffect(() => {
    let total = 0;
    let count = 0;
    const moreWidth = moreRef.current?.offsetWidth || 0;

    for (let i = 0; i < pills.length; i++) {
      const el = pillRefs.current[i];
      if (!el) continue;

      const width = el.offsetWidth;
      const isLastVisible = count === pills.length - 1;
      const willOverflow =
        total + width + (isLastVisible ? 0 : moreWidth) > MAX_WIDTH;

      if (willOverflow) break;

      total += width;
      count++;
    }

    setVisibleCount(count);
  }, [pills]);

  const hiddenPills = pills.slice(visibleCount);
  const hiddenCount = hiddenPills.length;

  return (
    <Flex gap={2} w={MAX_WIDTH}>
      {pills.slice(0, visibleCount).map((pill, index) => (
        <div
          key={pill.title}
          ref={(el) => {
            pillRefs.current[index] = el;
          }}
        >
          <Pill size="xs">{pill.title}</Pill>
        </div>
      ))}

      {hiddenCount > 0 && (
        <Popover
          width="auto"
          position="bottom-start"
          withArrow
          shadow="md"
          opened={popoverOpened}
          onChange={setPopoverOpened}
        >
          <Popover.Target>
            <div
              ref={moreRef}
              onMouseEnter={() => setPopoverOpened(true)}
              onMouseLeave={() => setPopoverOpened(false)}
            >
              <Pill size="xs">+{hiddenCount} more</Pill>
            </div>
          </Popover.Target>
          <Popover.Dropdown onMouseLeave={() => setPopoverOpened(false)}>
            <div className="flex flex-col">
              {hiddenPills.map((pill) => (
                <Pill size="xs" key={pill.title}>
                  {pill.title}
                </Pill>
              ))}
            </div>
          </Popover.Dropdown>
        </Popover>
      )}
    </Flex>
  );
}

function highlightText(text: string, query: string) {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} style={{ color: "var(--highlight-color)" }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

const extractPlainText = (doc: PortableTextDocument): string => {
  return doc
    .map((block) => {
      if (block._type === "block" && Array.isArray(block.children)) {
        return block.children.map((child) => child.text).join("");
      }
      return "";
    })
    .join("\n");
};

const splitIntoSentences = (text: string): string[] => {
  return text.split(/(?<=[.!?؟]|[ۚۛۗۙ])\s+|\n+/g).filter(Boolean);
};

export const ArticleCardPlaceHolder = () => {
  console.log("here!!!");
  return (
    <>
      <Skeleton width={"100%"} height={260} />
    </>
  );
};
