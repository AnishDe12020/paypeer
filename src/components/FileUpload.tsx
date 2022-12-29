import {
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  FormErrorMessage,
  Icon,
  Button,
  Text,
} from "@chakra-ui/react";
import { useController } from "react-hook-form";
import { ChangeEvent, useRef } from "react";
import { Upload } from "react-feather";
import axios from "axios";

interface FileUploadProps {
  name: string;
  acceptedFileTypes?: string;
  control: any;
  children: React.ReactNode;
  isRequired?: boolean;
  filename?: string;
}

const FileUpload = ({
  name,
  acceptedFileTypes,
  children,
  isRequired = false,
  filename,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];

      const {
        data: { url },
      } = await axios.post(`/api/upload-url`, {
        filename: file.name,
      });

      await axios.put(url, file, {
        withCredentials: false,
        headers: {
          "Content-Type": file.type,
          "Access-Control-Allow-Origin": "*",
        },
      });

      const puburl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKEN_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${file.name}`;

      console.log(puburl);
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
        >
          {children}
        </Button>
      </InputGroup>
    </FormControl>
  );
};

export default FileUpload;
