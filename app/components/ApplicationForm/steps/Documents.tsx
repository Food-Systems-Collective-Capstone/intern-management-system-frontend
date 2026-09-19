type DocumentsProps = {
  resume: File | null;
  onResumeChange: (file: File | null) => void;
};

export function Documents({ resume, onResumeChange }: DocumentsProps) {
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    onResumeChange(file);
  }

  return (
    <div>
      <h2>Documents</h2>

      <label htmlFor="resume">Upload your resume</label>

      <input
        id="resume"
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
      />

      {resume && <p>Selected file: {resume.name}</p>}
    </div>
  );
}
