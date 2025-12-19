import {
  Autocomplete,
  Container,
  Grid,
  Group,
  Text,
  Stack,
} from "@mantine/core";
import classes from "./Library.module.css";

import { IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "../client";
import { badges } from "../utils";
import Pill from "../components/Pill";
import { ArticleCard, ArticleCardPlaceHolder } from "../components/Card";
import { useNavigate } from "react-router";
import { useState } from "react";
import type { Post } from "../types";
import PageTransition from "../animations/PageTransition";
import { MultiplePlaceHolder } from "../components/MultiplePlaceHolder";

const fetchNewPosts = async () => {
  const query = `*[_type == "post"] {
    _id,
    title,
    slug,
    image {
      asset->{
        url
      }
    },
    body[]{
      ...,
      asset->{
        _id,
        url
      },
    _type == "carousel" => {
      _type,
      slides[] {
        asset->{
          _id,
          url
        }
      }
    },
    },
    tags,
    publishedAt
  }`;
  const posts = await sanityClient.fetch(query);
  return posts;
};

function Library() {
  const navigate = useNavigate();
  const { isLoading, data } = useQuery<Post[]>({
    queryKey: ["newPosts"],
    queryFn: fetchNewPosts,
  });

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");

  const onClickCard = (slug: string) => {
    navigate(`/post/${slug}`);
  };

  const filteredPosts = data?.filter((post) => {
    const matchesTags = selected.length
      ? post.tags.some((tag: string) => selected.includes(tag))
      : true;

    const bodyText = post.body
      .map((block: any) => {
        if (block._type === "block" && block.children) {
          return block.children.map((child: any) => child.text).join(" ");
        }
        return ""; // ignore non-block types
      })
      .join(" ");

    const combinedText = `${post.title} ${bodyText}`.toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch = search ? combinedText.includes(searchLower) : true;

    return matchesTags && matchesSearch;
  });

  return (
    <>
      <div>
        <Stack
          h={"100%"}
          className={classes.image__text}
          justify="center"
          gap={0}
        >
          <h1 className={classes.header}>
            Articles from the True Islam Library
          </h1>
          <Text className={classes.sub} fw={800}>
            Your source for authentic Islamic articles, insights, and
            understanding.
          </Text>
        </Stack>
      </div>
      <Container my="lg">
        <Autocomplete
          flex={2}
          placeholder="Search"
          onChange={setSearch}
          leftSection={<IconSearch size={16} stroke={1.5} />}
        />
        <Text size="sm" mt="sm" c="dimmed">
          Filters
        </Text>
        <Group my="sm">
          {badges.map((badge) => {
            const isSelected = selected.includes(badge.value);

            return (
              <Pill
                key={badge.value}
                selected={isSelected}
                onClick={() => {
                  setSelected((prev) =>
                    isSelected
                      ? prev.filter((tag) => tag !== badge.value)
                      : [...prev, badge.value]
                  );
                }}
              >
                {badge.title}
              </Pill>
            );
          })}
        </Group>
        <Grid>
          {isLoading && (
            <MultiplePlaceHolder
              placeHolder={
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <ArticleCardPlaceHolder />
                </Grid.Col>
              }
            />
          )}
          {filteredPosts?.map((post) => (
            <Grid.Col key={post._id} span={{ base: 12, sm: 6, md: 4 }}>
              <ArticleCard
                title={post.title}
                body={post.body}
                tags={post.tags}
                onClick={() => onClickCard(post.slug.current)}
                search={search}
              />
            </Grid.Col>
          ))}
        </Grid>

        {data &&
          filteredPosts?.length === 0 &&
          (search || selected.length > 0) && (
            <Text ta="center" mt="xl" c="dimmed" fw={500}>
              No results found.
            </Text>
          )}
      </Container>
    </>
  );
}

export default PageTransition(Library);
