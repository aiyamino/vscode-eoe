import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios'
import { Utility } from './utility';

// UNSAFE
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export interface ASoulTag {
    tag_id: number
    tag_title: string
}
export interface ASoulGetRandomPicResult {
    img: string,
    dy_url: string,
    tags: ASoulTag[]
}
export type ImageSource = ASoulGetRandomPicResult | vscode.Uri | string
export function isASoulGetRandomPicResult(source: ImageSource): source is ASoulGetRandomPicResult {
    const result = source as ASoulGetRandomPicResult
    return result.img !== undefined && result.dy_url !== undefined
}

export default class Asset {
    public readonly TYPE_URL_IMAGE = 'url';
    public readonly TYPE_RANDOM = 'random';
    public readonly TYPE_DEFAULT = 'default';

    public constructor(private context: vscode.ExtensionContext) {
    }

    public async getImageUri(): Promise<ImageSource> {
        const type: string = this.getConfigType();
        let images: ImageSource[];

        if (type === this.TYPE_RANDOM) {
            images = await this.getRandomImages();
        } else if (type === this.TYPE_URL_IMAGE) {
            images = this.getCustomImages();
        } else {
            images = this.getDefaultImages();
        }
        // user forget setting customImages, get random images
        if (type === this.TYPE_URL_IMAGE && images.length === 0) {
            images = await this.getRandomImages();
        }
        // maybe offline
        if (images.length === 0) {
        images = this.getDefaultImages();
        }
        const image = this.getRandomOne(images);

        return image;
    }

    protected getRandomOne(images: ImageSource[]): ImageSource {
        const n = Math.floor(Math.random() * images.length + 1) - 1;
        return images[n];
    }

    protected getDefaultImages(): vscode.Uri[] {
        const dirPath = this.getDefaultAsoulImagePath();
        const files = this.readPathImage(dirPath);
        return files;
    }

    protected readPathImage(dirPath: string): vscode.Uri[] {
        let files: vscode.Uri[] = [];
        const result = fs.readdirSync(dirPath);
        result.forEach(function (item, index) {
            const stat = fs.lstatSync(path.join(dirPath, item));
            if (stat.isFile()) {
                files.push(vscode.Uri.file(path.join(dirPath, item)).with({ scheme: 'vscode-resource' }));
            }
        });
        return files;
    }

    protected getDefaultAsoulImagePath() {
        return path.join(this.context.extensionPath, 'images/asoul');
    }

    protected getConfigType(): string {
        return Utility.getConfiguration().get<string>('type', 'random');
    }

    protected getCustomImages() {
        return Utility.getConfiguration().get<string[]>('customImages', []);
    }

    protected async getRandomImages() {
        try {
            const response = await axios.get<ASoulGetRandomPicResult>(
                "https://api.asoul.cloud:8000/getRandomPic",
                {timeout: 5000});
            return [response.data];
        } catch (err) {
            return [] as ASoulGetRandomPicResult[];
        }
    }

    public getTitle(): string {
        return Utility.getConfiguration().get<string>('title', '');
    }
}
