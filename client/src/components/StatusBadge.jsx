const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status.toLowerCase()}`}>
    <span className="badge-dot" />
    {status}
  </span>
);

export default StatusBadge;
