import { FormControl, InputGroup, Icon, Button } from "@chakra-ui/react";
import { ChangeEvent, useRef, useState } from "react";
import { Upload } from "lucide-react";
import axios from "axios";

interface FileUploadProps {
  name: string;
  acceptedFileTypes?: string;
  children: React.ReactNode;
  filename?: string;
  onUpload?: (url: string) => void;
}

const FileUpload = ({
  name,
  acceptedFileTypes,
  children,
  filename,
  onUpload,
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];

      setIsUploading(true);

      const {
        data: { url },
      } = await axios.post(`/api/upload-url`, {
        filename: filename ?? file.name,
      });

      await axios.put(url, file, {
        withCredentials: false,
        headers: {
          "Content-Type": file.type,
          "Access-Control-Allow-Origin": "*",
        },
      });

      const puburl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${
        process.env.NEXT_PUBLIC_AWS_REGION
      }.amazonaws.com/${filename ?? file.name}`;

      onUpload && onUpload(puburl);

      setIsUploading(false);
    }
  };

  return (
    <FormControl>
      <InputGroup>
        <input
          type="file"
          accept={acceptedFileTypes}
          ref={inputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <Button
          leftIcon={<Icon as={Upload} />}
          onClick={() => inputRef.current && inputRef.current.click()}
          isLoading={isUploading}
        >
          {children}
        </Button>
      </InputGroup>
    </FormControl>
  );
};

export default FileUpload;
