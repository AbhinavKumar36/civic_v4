import React, { useState } from 'react';
import { CivicInputComposer } from '../../components/ui/CivicInputComposer';

export const SubmitNeed: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/v1/civic-inputs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Unknown error');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Submit a Community Need</h2>
        <p className="text-muted dark:text-gray-400 mt-2">
          Your submission will be converted into a structured civic demand using AI. Future analysis will combine citizen demand with public evidence before development priorities are determined. AI is NOT deciding government action.
        </p>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200 text-center">
          Successfully submitted! The AI is now processing your input.
        </div>
      )}

      <CivicInputComposer onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};
