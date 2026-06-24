import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDestinationBySlug, CATEGORY_LABELS, type ActivityCategory } from '@/data/destinations';
import { usePlatformStore } from '@/lib/store';

export default function Compare() {
  const { compare, toggleCompare, clearCompare } = usePlatformStore();
  const dests = compare
    .map((slug) => getDestinationBySlug(slug))
    .filter((d): d is NonNullable<typeof d> => !!d);

  if (dests.length === 0) {
    return (
      <div className="compare compare--empty">
        <h1>Compare destinations</h1>
        <p>Add destinations from the Explore page to compare them side by side.</p>
        <Link to="/explore" className="btn btn--primary">Browse destinations</Link>
      </div>
    );
  }

  const minPrice = (d: (typeof dests)[number]) =>
    Math.min(...d.activities.map((a) => a.pricePerPerson));
  const categories = (d: (typeof dests)[number]) =>
    [...new Set(d.activities.map((a) => a.category))] as ActivityCategory[];

  const ROWS: { label: string; render: (d: (typeof dests)[number]) => React.ReactNode }[] = [
    { label: 'Region', render: (d) => d.region },
    { label: 'From', render: (d) => `₹${minPrice(d).toLocaleString('en-IN')}` },
    { label: 'Activities', render: (d) => d.activities.length },
    { label: 'Elevation', render: (d) => `${d.elevation.toLocaleString('en-IN')} m` },
    { label: 'Best season', render: (d) => d.bestSeason },
    {
      label: 'Experience types',
      render: (d) => (
        <div className="compare__tags">
          {categories(d).map((c) => (
            <span key={c} className="compare__tag">{CATEGORY_LABELS[c]}</span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="compare">
      <header className="compare__head">
        <div>
          <span className="eyebrow">Side by side</span>
          <h1>Compare destinations</h1>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={clearCompare}>Clear all</button>
      </header>

      <div className="compare__scroll">
        <motion.table
          className="compare__table"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <thead>
            <tr>
              <th className="compare__corner" />
              {dests.map((d) => (
                <th key={d.id}>
                  <div className="compare__card-head">
                    <div
                      className="compare__thumb"
                      style={{ backgroundImage: `url(${d.image})` }}
                    />
                    <strong>{d.name}</strong>
                    <p>{d.tagline}</p>
                    <div className="compare__card-actions">
                      <Link to={`/destination/${d.slug}`} className="btn btn--primary btn--sm">View</Link>
                      <button
                        className="link-btn"
                        onClick={() => toggleCompare(d.slug)}
                        aria-label={`Remove ${d.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {dests.map((d) => (
                  <td key={d.id}>{row.render(d)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </motion.table>
      </div>
    </div>
  );
}
