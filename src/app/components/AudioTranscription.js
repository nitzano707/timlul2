import { useState } from 'react';
import { Upload } from 'lucide-react';

const AudioTranscription = () => {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/')) {
        if (selectedFile.size > 25 * 1024 * 1024) {
          setError('הקובץ גדול מדי. הגודל המקסימלי הוא 25MB');
          setFile(null);
          return;
        }
        setFile(selectedFile);
        setError('');
        setTranscription('');
        setProgress(0);
      } else {
        setError('אנא בחר קובץ אודיו תקין (mp3, wav, m4a, etc)');
        setFile(null);
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      if (droppedFile.size > 25 * 1024 * 1024) {
        setError('הקובץ גדול מדי. הגודל המקסימלי הוא 25MB');
        return;
      }
      setFile(droppedFile);
      setError('');
      setTranscription('');
      setProgress(0);
    } else {
      setError('אנא בחר קובץ אודיו תקין');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError('אנא בחר קובץ לתמלול');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('language', 'he');  // שפה עברית
      
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'שגיאה בתמלול הקובץ');
      }

      const data = await response.json();
      setTranscription(data.text);
      setProgress(100);
    } catch (err) {
      console.error('Transcription error:', err);
      setError('שגיאה בתהליך התמלול: ' + (err.message || 'אנא נסה שנית'));
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-right mb-8">תמלול קבצי אודיו</h1>
      
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
          id="audio-input"
        />
        <label
          htmlFor="audio-input"
          className="cursor-pointer flex flex-col items-center justify-center space-y-4"
        >
          <Upload className="w-16 h-16 text-gray-400" />
          <div className="text-gray-500">
            {file ? (
              <div className="space-y-2">
                <p className="font-medium text-blue-600">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">גרור קובץ אודיו לכאן או לחץ לבחירה</p>
                <p className="text-sm text-gray-500">MP3, WAV, M4A עד 25MB</p>
              </div>
            )}
          </div>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-right">
          <p className="font-medium">שגיאה</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleTranscribe}
        disabled={!file || loading}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors
          ${loading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>מתמלל...</span>
          </div>
        ) : 'התחל תמלול'}
      </button>

      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {transcription && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-right">תוצאת התמלול:</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="whitespace-pre-wrap text-right leading-relaxed">{transcription}</p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                navigator.clipboard.writeText(transcription);
                alert('הטקסט הועתק ללוח');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              העתק טקסט
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioTranscription;
