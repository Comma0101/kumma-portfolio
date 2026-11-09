/* THESIS. Belonging appears through overlapping street impressions.
 * OWN-WORLD. Incumbent paper, black/red ink, Sprat and Junicode, actual maps.
 * STORY. One history crosses places. Several histories share a place.
 * FIRST VIEWPORT. A large two-city print beside the title and personal motive.
 * FORM. Two approved visual studies within Work, followed by provenance.
 */
import Link from "next/link";
import Shell from "./Shell";
import MapArtPrint from "./MapArtPrint";
import styles from "./MapArt.module.css";

export default function MapArt() {
  return (
    <Shell mainClassName={styles.body}>
      <section className={styles.opening} aria-labelledby="map-art-title">
        <header className={styles.introduction}>
          <Link href="/work" className={styles.back}>← Work</Link>
          <h1 id="map-art-title" className={styles.title}>Map Art</h1>
          <p className={styles.lede}>
            Where we come from, where we have lived, and where we live now.
          </p>
          <p className={styles.personal}>
            I’m interested in how those places give us a sense of belonging,
            and how our histories overlap through the places we share.
          </p>
        </header>
        <figure className={styles.firstStudy}>
          <MapArtPrint study="one-life" />
          <figcaption className={styles.caption}>
            <div>
              <h2>Two places, one history.</h2>
              <p>Amsterdam and Los Angeles.</p>
            </div>
            <p className={styles.illustrative}>Illustrative composition</p>
          </figcaption>
        </figure>
      </section>

      <section className={styles.sharedStudy} aria-labelledby="shared-places-heading">
        <header className={styles.sharedIntroduction}>
          <h2 id="shared-places-heading">A place in common.</h2>
          <p>
            Different lives can pass through the same place.
            A familiar street becomes part of more than one history.
          </p>
        </header>
        <figure className={styles.secondStudy}>
          <MapArtPrint study="shared-places" />
          <figcaption className={styles.caption}>
            <div>
              <h3>Several histories, a shared place.</h3>
              <p>Three imagined histories meet in Amsterdam.</p>
            </div>
            <p className={styles.illustrative}>Illustrative composition</p>
          </figcaption>
        </figure>
      </section>

      <section className={styles.making} aria-labelledby="making-heading">
        <h2 id="making-heading">About the drawings.</h2>
        <div className={styles.makingCopy}>
          <p>
            These two studies explore the idea using real street geometry
            and imagined histories. Each place is fitted independently.
            The connecting lines are authored gestures.
          </p>
          <p>
            Amsterdam uses a canal-ring extract. Los Angeles, Pasadena and
            Long Beach use cropped structural networks from Los Angeles County.
            The linework combines street traces with the Map Art renderer’s
            topology-selected handwriting.
          </p>
          <p className={styles.credit}>
            Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>,
            available under <a href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL 1.0</a>.
            The underlying Map Art project draws architectural inspiration from{" "}
            <a href="https://github.com/anvaka/city-roads">City Roads</a>.
          </p>
          <div className={styles.downloads}>
            <a href="/art/map-art/one-life.svg" download>Download the two-place print <span aria-hidden="true">↘</span></a>
            <a href="/art/map-art/shared-places.svg" download>Download the shared-place print <span aria-hidden="true">↘</span></a>
          </div>
        </div>
      </section>
    </Shell>
  );
}
