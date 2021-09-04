import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a>
            <img src="/spacetraveling.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </div>
  )
}
