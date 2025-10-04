export default function Card({ title, subtitle, number }) {
    return (
      <div className="bg-neutral-950 flex flex-col p-2 border border-neutral-500 rounded-md">
        <span className="text-neutral-500">{title}</span>
        <span className="text-3xl my-4">{number}</span>
        <span className="text-neutral-400 text-sm">{subtitle}</span>
      </div>
    );
  }
  