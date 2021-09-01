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
    const result = source as ASoulGetRandomPicResult;
    return result.img !== undefined && result.dy_url !== undefined && result.tags !== undefined;
}
export function isUri(source: ImageSource): source is vscode.Uri {
    const result = source as vscode.Uri;
    return result.path !== undefined;
}

export default class Asset {
    public readonly TYPE_URL_IMAGE = 'url';
    public readonly TYPE_RANDOM = 'random';
    public readonly TYPE_DEFAULT = 'default';
    public readonly TYPE_CAO = "cao";
    public readonly TYPE_NIUNIU = "niuniu";

    public readonly NAME_AVA = 'ava';
    public readonly NAME_BELLA = 'bella';
    public readonly NAME_CAROL = 'carol';
    public readonly NAME_DIANA = 'diana';
    public readonly NAME_EILEEN = 'eileen';
    public readonly NAME_OTHERS = 'others';

    public constructor(private context: vscode.ExtensionContext) {
    }

    public async getImageUri(): Promise<ImageSource> {
        const type: string = this.getConfigType();
        let images: ImageSource[];

        if (type === this.TYPE_RANDOM) {
            images = await this.getRandomImages();
        } else if (type === this.TYPE_URL_IMAGE) {
            images = this.getCustomImages();
        } else if (type === this.TYPE_CAO) {
            images = this.getCaoImages();
        } else if (type === this.TYPE_NIUNIU) {
            images = this.getNiuImages();
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

    protected getCaoImages(): vscode.Uri[] {
        const dirPath = this.getDefaultCaoImagePath();
        const files = this.readPathImage(dirPath);
        return files;
    }

    protected getNiuImages(): vscode.Uri[] {
        return [vscode.Uri.file(path.join(this.context.extensionPath, 'images/niuniu.gif')).with({ scheme: 'vscode-resource' })]
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

    protected getDefaultCaoImagePath() {
        return path.join(this.context.extensionPath, 'images/cao');
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
                {timeout: 8000});
            return [response.data];
        } catch (err) {
            return [] as ASoulGetRandomPicResult[];
        }
    }

    public getTitle(): string {
        return Utility.getConfiguration().get<string>('title', '');
    }

    public getName(tags: ASoulTag[]): string {
        let tagsCnt = 0;
        let name = this.NAME_OTHERS;
        tags.forEach(element => {
            if (element.tag_title.includes('向晚') && name != this.NAME_AVA) {
                tagsCnt++;
                name = this.NAME_AVA;
            }
            if (element.tag_title.includes('贝拉') && name != this.NAME_BELLA) {
                tagsCnt++;
                name = this.NAME_BELLA;
            }
            if (element.tag_title.includes('珈乐') && name != this.NAME_CAROL) {
                tagsCnt++;
                name = this.NAME_CAROL;
            }
            if (element.tag_title.includes('嘉然') && name != this.NAME_DIANA) {
                tagsCnt++;
                name = this.NAME_DIANA;
            }
            if (element.tag_title.includes('乃琳') && name != this.NAME_EILEEN) {
                tagsCnt++;
                name = this.NAME_EILEEN;
            }
        });
        if (tagsCnt != 1) {
            name  = this.NAME_OTHERS;
        }
        return name;
    }

    public getNameFromUri(uri: vscode.Uri): string {
        let name = this.NAME_OTHERS;
        if (uri.path.includes('ava')) {
            name = this.NAME_AVA;
        }
        if (uri.path.includes('bella')) {
            name = this.NAME_BELLA;
        }
        if (uri.path.includes('carol')) {
            name = this.NAME_CAROL;
        }
        if (uri.path.includes('diana')) {
            name = this.NAME_DIANA;
        }
        if (uri.path.includes('eileen')) {
            name = this.NAME_EILEEN;
        }
        return name;
    }

    public getNamedTitle(name: string): string {
        let title = "";
        if (name === this.NAME_AVA) {
            title = Utility.getConfiguration().get<string>('titleAva', '');
        } else if (name === this.NAME_BELLA) {
            title = Utility.getConfiguration().get<string>('titleBella', '');
        } else if (name === this.NAME_CAROL) {
            title = Utility.getConfiguration().get<string>('titleCarol', '');
        } else if (name === this.NAME_DIANA) {
            title = Utility.getConfiguration().get<string>('titleDiana', '');
        } else if (name === this.NAME_EILEEN) {
            title = Utility.getConfiguration().get<string>('titleEileen', '');
        }

        if (title === ""){
            title = Utility.getConfiguration().get<string>('title', '');
        }
        return title;
    }
}
