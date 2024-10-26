import { useState } from 'react';
import { Upload } from 'lucide-react';

const AudioTranscription = () => {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('אנא בחר קובץ אודיו תקין');
      setFile(null);
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError('אנא בחר קובץ לתמלול');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'whisper-large-v3-turbo');
      
      const response = await fetch('YOUR_GROQ_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY',
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('שגיאה בתמלול הקובץ');
      }

      const data = await response.json();
      setTranscription(data.text);
    } catch (err) {
      setError('שגיאה בתהליך התמלול: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-right">תמלול קבצי אודיו</h1>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
          id="audio-input"
        />
        <label
          htmlFor="audio-input"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <span className="text-gray-500">
            {file ? file.name : 'לחץ להעלאת קובץ אודיו'}
          </span>
        </label>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-right">
          {error}
        </div>
      )}

      <button
        onClick={handleTranscribe}
        disabled={!file || loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? 'מתמלל...' : 'התחל תמלול'}
      </button>

      {transcription && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-right">תוצאת התמלול:</h2>
          <p className="whitespace-pre-wrap text-right">{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default AudioTranscription;
