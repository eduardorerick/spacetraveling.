import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState([]);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  useEffect(() => {
    return setPosts(postsPagination.results);
  }, [postsPagination.results]);

  function fetchNextPage(): void {
    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        setNextPage(data.next_page);
        setPosts([...posts, ...data.results]);
      });
  }

  return (
    <div className={styles.Container}>
      {posts.map(post => (
        <div className={styles.contentContainer} key={post.uid}>
          <Link href={`/post/${post.uid}`}>
            <a>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div className={styles.authorContainer}>
                <div>
                  <FiCalendar />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                </div>
                <div>
                  <FiUser /> <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        </div>
      ))}

      {nextPage !== null && (
        <button
          onClick={fetchNextPage}
          type="button"
          className={styles.nextPageButton}
        >
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 5,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
