/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { ptBR } from 'date-fns/locale';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
  first_publication_date: string | null;
  uid: string;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }
  const blocks = post.data.content.map(item => {
    const headingWords = item.heading.split(' ');
    const bodyWords = item.body.map(i => {
      return i.text.split(' ');
    });
    const totalWords = headingWords.concat(bodyWords.flat(2));
    return totalWords;
  });
  const totalWordsArray = blocks.flat();
  const readTime = totalWordsArray.length / 200;

  return (
    <div className={styles.postPage}>
      <img
        src={JSON.stringify(post.data.banner.url)}
        alt={post.data.title}
        className={styles.postImage}
      />
      <div className={styles.titleContainer}>
        <h1>{post.data.title}</h1>
        <div className={styles.titleContent}>
          <div>
            <FiCalendar />
            <time>
              {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
          </div>
          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div>
            <FiClock />
            {String(
              Number.isInteger(readTime)
                ? String(readTime)
                : Math.floor(readTime + 1)
            ).concat(' min')}
          </div>
        </div>
      </div>
      {post.data.content.map(item => (
        <div key={uuid()}>
          <h1>{item.heading}</h1>
          <div>
            {item.body.map(i => {
              return i.text;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const { results } = await prismic.query('');
  const formatedResults = results.map(item => {
    const posts = {
      params: { slug: item.uid },
    };
    return posts;
  });
  return {
    paths: formatedResults,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { params } = context;
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
    first_publication_date: response.first_publication_date,
    uid: response.uid,
  };
  return {
    props: {
      post,
    },
    revalidate: 1,
  };
};
