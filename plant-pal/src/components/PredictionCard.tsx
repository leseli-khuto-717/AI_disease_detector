interface PredictionProps {
  id?: string;
  disease: string;
  severity: string;
  treatment: string;
  onDelete?: (id: string) => void;
}

export const PredictionCard: React.FC<PredictionProps> = ({
  id,
  disease,
  severity,
  treatment,
  onDelete,
}) => (
  <div className="bg-green-100 rounded-xl shadow-md p-4 flex flex-col gap-2 w-full">
    <h2 className="text-lg font-bold text-green-800">{disease}</h2>
    <p><strong>Severity:</strong> {severity}</p>
    <p><strong>Treatment:</strong> {treatment}</p>
    {id && onDelete && (
      <button
        onClick={() => onDelete(id)}
        className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Delete
      </button>
    )}
  </div>
);
