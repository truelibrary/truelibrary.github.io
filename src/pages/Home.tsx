import { Container, Flex, Text, Divider, Skeleton } from "@mantine/core";
import PageTransition from "../animations/PageTransition";
import classes from "./Home.module.css";
import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "../client";
import type { Post } from "../types";
import { Link } from "react-router";
import Bismillah from "../assets/Bismillah_Calligraphy.svg";
import { MultiplePlaceHolder } from "../components/MultiplePlaceHolder";

const categories = [
  { title: "Islam", value: "islam" },
  // { title: "Atheist", value: "atheist" },
  { title: "Christians", value: "christian" },
  { title: "Aqeedah", value: "aqeedah" },
  { title: '"Salafi" / Wahabi', value: "wahabi" },
  { title: "Quranist", value: "quranist" },
  { title: "Shias", value: "shia" },
];

const fetchCategoryPosts = async () => {
  const query = `*[_type == "post" && defined(category)]{
    _id,
    title,
    slug,
    category,
    categoryWeight
  }`;

  const posts = await sanityClient.fetch(query);
  return posts;
};

function Home() {
  const { isLoading, data } = useQuery<Post[]>({
    queryKey: ["categoryPosts"],
    queryFn: fetchCategoryPosts,
  });

  return (
    <Container className={classes.container} size={"sm"} pb={"xl"}>
      <Flex align={"center"} direction={"column"}>
        <h1>True Islam Library</h1>
        <img height={48} src={Bismillah} />
      </Flex>
      <Container size={"sm"}>
        {categories.map((category) => (
          <div key={category.value}>
            <h2>{category.title}</h2>
            <Flex direction={"column"} gap={12}>
              {isLoading && (
                <MultiplePlaceHolder
                  amount={6}
                  placeHolder={<Skeleton height={32} />}
                />
              )}
              {data
                ?.filter((post) => post.category === category.value)
                .sort(
                  (a, b) =>
                    //Infinity here because categoryWeight can be undefined
                    (a.categoryWeight || Infinity) -
                    (b.categoryWeight || Infinity)
                )
                .map((post) => (
                  <Link
                    className={classes.link}
                    to={`/post/${post.slug.current}`}
                  >
                    <Text>{post.title}</Text>
                    <Divider mt={16} />
                  </Link>
                ))}
            </Flex>
          </div>
        ))}
      </Container>
    </Container>
  );
}

export default PageTransition(Home);
