import { useState } from 'react';
import { Upload, File, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket: string;
  path: string;
  onSuccess: (url: string) => void;
  label?: string;
}

export default function FileUpload({ bucket, path, onSuccess, label }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const selectedFile = e.target.files[0];
      if (!selectedFile) return;

      setFile(selectedFile);

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

      onSuccess(data.publicUrl);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado';
      toast.error('Erro no upload: ' + message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-500 transition-colors bg-gray-50/50">
        <input
          type="file"
          onChange={handleUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : file ? (
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <File size={20} />
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              <Check size={16} className="text-green-500" />
            </div>
          ) : (
            <>
              <Upload className="text-gray-400" size={24} />
              <p className="text-sm text-gray-500">Clique ou arraste para enviar (PDF/IMG)</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
