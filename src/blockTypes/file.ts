import { type GlobalFieldAttributes } from './globalField';

export type FileAttributes = GlobalFieldAttributes & {
	multiple: boolean;
	acceptTypes: string;
	maxFileSize: number;
	maxFiles: number;
	allowUrlUpload: boolean;
};

