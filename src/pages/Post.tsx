import {
  Avatar,
  Blockquote,
  Button,
  Center,
  Container,
  Divider,
  Drawer,
  Flex,
  Group,
  Loader,
  Stack,
  TableOfContents,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { sanityClient } from "../client";
import { useQuery } from "@tanstack/react-query";
import { PortableText } from "@portabletext/react";
import { useParams } from "react-router";
import ReactPlayer from "react-player";
import Pill from "../components/Pill";
import { type Post } from "../types";
import { badges } from "../utils";
import classes from "./Post.module.css";
import { useDisclosure } from "@mantine/hooks";
import NoArticleFound from "./NoArticleFound";
import Bismillah from "../assets/Bismillah_Calligraphy.svg";
import {
  authorAvatarMap,
  type AvatarMapper,
} from "../assets/authorAvatars/mapper";
import { Carousel } from "@mantine/carousel";
import { useRef, type ReactNode } from "react";
import { useInViewport } from "../hooks/useInViewport";

const fetchPost = async (slug: string) => {
  const query = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  image{ asset->{ url } },
  body[]{
    ...,
    _type == "carousel" => {
      _type,
      slides[]{ asset->{ _id, url } }
    },
    _type == "image" => {
      _type,
      asset->{ _id, url },
      alt
    },
    _type == "fileAttachment" => {
      _type,
      description,
      file{
        asset->{
          _id,
          url,
          mimeType,
          originalFilename
        }
      }
    }
  },
  tags,
  author,
  publishedAt
}`;
  const params = { slug };
  const post = await sanityClient.fetch(query, params);
  return post;
};

function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const ref = useRef(null);
  const { isVisible } = useInViewport(ref);

  const { data, error, isPending, isError } = useQuery<Post>({
    queryKey: ["newPosts", slug],
    queryFn: () => fetchPost(slug!),
    enabled: !!slug,
  });

  if (isPending)
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (isError) return <Center>Error: {(error as Error).message}</Center>;
  if (!data) return <NoArticleFound />;

  const tableOfContents = (
    <>
      <Text ml={4} size="sm" my="xs" c="dimmed">
        Table of contents
      </Text>
      <TableOfContents
        variant="filled"
        scrollSpyOptions={{
          selector: "h1, h2, h3, h4, h5, h6",
        }}
        getControlProps={({ data }) => ({
          onClick: () => {
            data.getNode().scrollIntoView();
            closeDrawer();
          },
          children: data.value,
        })}
      />
    </>
  );

  return (
    <Container display={!isMobile ? "flex" : ""} size="xl" pt={"sm"}>
      <Group
        gap={12}
        className={`${classes.tags__wrapper} ${isVisible ? classes.sidebar__open : classes.sidebar__closed}`}
        pb={12}
        px={14}
        visibleFrom="md"
      >
        <Stack className={classes.sidebar__inner}>
          <Text size="sm" ml={4} mt="sm" my="sm" c="dimmed">
            Tags
          </Text>
          <Flex wrap="wrap" gap={4}>
            {data.tags.map((tag) => (
              <Pill key={tag} isSelectable={false}>
                {badges.find((b) => b.value === tag)?.title}
              </Pill>
            ))}
          </Flex>
          <Stack>
            <Text size="sm" ml={4} mt="sm" my="sm" c="dimmed">
              Author
            </Text>
            <Flex align={"center"} gap={4}>
              <Avatar
                src={authorAvatarMap[data.author as keyof AvatarMapper]}
                alt=""
              />
              <Text ml={4}>{data.author}</Text>
            </Flex>
          </Stack>
          {!isMobile && tableOfContents}
        </Stack>

        <div ref={ref} />
      </Group>
      <Flex
        direction="column"
        className={`${classes.content} ${isVisible ? classes.content__narrow : classes.content__wide}`}
      >
        {isMobile && (
          <>
            <Button onClick={openDrawer} variant="light" mb="md">
              Table of Contents
            </Button>
            <PostInfo data={data} tableOfContents={tableOfContents} />
            <Divider my={"lg"} pb={"sm"} />
            <Drawer
              opened={drawerOpened}
              onClose={closeDrawer}
              withCloseButton={true}
              position="right"
              size="100%"
              overlayProps={{ opacity: 1 }}
              withinPortal={false}
              styles={{
                content: {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  height: "100vh",
                  width: "100vw",
                  maxWidth: "100vw",
                  maxHeight: "100vh",
                  borderRadius: 0,
                },
                body: {
                  height: "100%",
                  padding: "1rem",
                  overflowY: "auto",
                },
              }}
            >
              {tableOfContents}
            </Drawer>
          </>
        )}
        <img height={48} src={Bismillah} />
        <h1>{data.title}</h1>
        <PortableText
          value={data.body}
          components={{
            listItem: {
              number: ({ children }) => (
                <li className={classes.list}>{children}</li>
              ),
              bullet: ({ children }) => (
                <li className={classes.list}>
                  <Text>{children}</Text>
                </li>
              ),
              link: ({ children, value }) => (
                // <a href={value.href} target={"_blank"}>
                <a href={value._key} target={"_blank"}>
                  <Text>{children}</Text>
                </a>
              ),
            },
            marks: {
              link: ({ children, value }) => (
                <a href={value.href} target={"_blank"}>
                  <Text>{children}</Text>
                </a>
              ),
            },
            types: {
              youtube: ({ value }) => (
                <div className={classes.youtube}>
                  <ReactPlayer
                    url={value.url}
                    width="100%"
                    height="100%"
                    controls
                  />
                </div>
              ),
              tiktok: ({ value }) => {
                const { url } = value;
                const match = url.match(/\/video\/(\d+)/);
                return (
                  <div className={classes.tiktok__container}>
                    <script async src="https://www.tiktok.com/embed.js" />
                    <div className={classes.tiktok__wrapper}>
                      <iframe
                        scrolling="no"
                        title="Tiktok"
                        src={`https://www.tiktok.com/player/v1/${match?.[1]}`}
                        className={classes.tiktok__video}
                        allow="encrypted-media;"
                      ></iframe>
                    </div>
                  </div>
                );
              },
              fileAttachment: ({ value }) => {
                const {
                  file: {
                    asset: { url },
                  },
                } = value;
                return (
                  <iframe
                    src={url}
                    width="100%"
                    height="1000px"
                    style={{ border: "none" }}
                    title="PDF Viewer"
                  />
                );
              },
              carousel: ({ value }) => {
                return (
                  <Carousel className={classes.carousel}>
                    {value.slides.map((slide: any) => (
                      <Carousel.Slide>
                        <img src={slide.asset.url} />
                      </Carousel.Slide>
                    ))}
                  </Carousel>
                );
              },
              image: ({ value }) => (
                <Center>
                  <img
                    src={value.asset.url}
                    alt=""
                    className={classes.image}
                    loading="lazy"
                  />
                </Center>
              ),
            },
            block: {
              blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
            },
          }}
        />
      </Flex>
    </Container>
  );
}

export default PostPage;

type PostInfoProps = {
  data: Post;
  responsive?: boolean;
  tableOfContents: ReactNode;
};
const PostInfo = ({ data, responsive, tableOfContents }: PostInfoProps) => {
  return (
    <Group
      gap={12}
      className={classes.tags__wrapper}
      pb={12}
      visibleFrom={responsive ? "md" : ""}
    >
      <Stack w={320}>
        <Text size="sm" ml={4} mt="sm" my="sm" c="dimmed">
          Tags
        </Text>
        <Flex wrap="wrap" gap={4}>
          {data.tags.map((tag) => (
            <Pill key={tag} isSelectable={false}>
              {badges.find((b) => b.value === tag)?.title}
            </Pill>
          ))}
        </Flex>
        <Stack>
          <Text size="sm" ml={4} mt="sm" my="sm" c="dimmed">
            Author
          </Text>
          <Flex align={"center"} gap={4}>
            <Avatar
              src={authorAvatarMap[data.author as keyof AvatarMapper]}
              alt=""
            />
            <Text ml={4}>{data.author}</Text>
          </Flex>
        </Stack>
        {responsive && tableOfContents}
      </Stack>
    </Group>
  );
};
