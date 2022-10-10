import { SchemaFieldFile } from 'models/schema';
import { useEffect, useState } from 'react';
import ImageUploading from 'react-images-uploading';
import { CgMathPlus, CgRemove } from 'react-icons/cg';

function FieldFile({
  label,
  schema,
  value,
  onValueChange,
}: {
  label?: string;
  schema: SchemaFieldFile;
  value: any;
  onValueChange?: (value: any) => void;
}) {
  const [filePath, setFilePath] = useState(value);

  useEffect(() => {
    setFilePath(value);
  }, [value]);

  return (
    <div className="w-full flex flex-col items-center">
      {label && (
        <div className="text-md font-bold mb-2 text-zinc-900">{label}</div>
      )}
      {schema.config.type === 'img' && (
        <ImageUploading
          value={filePath}
          onChange={(e) => {
            setFilePath(e[0].file?.path);
            if (onValueChange) {
              onValueChange(e[0].file?.path);
            }
          }}
          dataURLKey="data_url"
        >
          {({ dragProps, onImageUpload, onImageUpdate }) => {
            return (
              // write your building UI
              <div
                className="bg-gray-800 rounded-md flex items-center justify-center p-1 hover:bg-gray-500 transition-all cursor-pointer"
                style={{
                  width: '80px',
                  height: '80px',
                }}
              >
                {!value && (
                  <button
                    className="flex text-white justify-center items-center w-full h-full"
                    onClick={onImageUpload}
                    {...dragProps}
                  >
                    <CgMathPlus className="mr-1" />
                    Upload
                  </button>
                )}
                {value && (
                  <div className="relative w-full h-full flex">
                    <img
                      className="m-auto"
                      src={value}
                      style={{
                        height: '72px',
                        objectFit: 'cover',
                      }}
                      alt=""
                      onClick={() => {
                        onImageUpdate(0);
                      }}
                    />
                    <CgRemove
                      className="cursor-pointer text-md absolute top-0 right-0 text-white"
                      onClick={() => {
                        if (onValueChange) {
                          onValueChange(null);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            );
          }}
        </ImageUploading>
      )}
    </div>
  );
}

export default FieldFile;
