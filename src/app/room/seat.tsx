interface Props {
  id: string;
  occupied: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export default function Seat({
  occupied,
  onClick,
  children,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        relative
        rounded-3xl
        border
        transition-all
        duration-300
        overflow-hidden

        ${occupied
          ? "bg-neutral-300"
          : "bg-white hover:bg-neutral-100"}
      `}
    >
      {children}
    </button>
  );
}