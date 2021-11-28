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
export interface ASoulOwner {
    name: string
    uid: number
}
export interface ASoulGetRandomPicResult {
    img: string,
    dy_url: string,
    tags: ASoulTag[],
    owner: ASoulOwner
}
export interface ASoulDefaultPicResult {
    img: string,
    tag: string
}
export type ImageSource = ASoulGetRandomPicResult | ASoulDefaultPicResult | vscode.Uri | string
export function isASoulGetRandomPicResult(source: ImageSource): source is ASoulGetRandomPicResult {
    const result = source as ASoulGetRandomPicResult;
    return result.img !== undefined && result.dy_url !== undefined && result.tags !== undefined;
}
export function isASoulDefaultPicResult(source: ImageSource): source is ASoulDefaultPicResult {
    const result = source as ASoulDefaultPicResult;
    return result.img !== undefined && result.tag !== undefined;
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
    public readonly TYPE_MIX = "mix";

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
        } else if (type === this.TYPE_MIX) {
            // generate random number from 0 to 100
            let random = Math.floor(Math.random() * 100);
            if (random < 90) {
                images = await this.getRandomImages();
            } else if (random < 95) {
                images = this.getCaoImages();
            } else {
                images = this.getNiuImages();
            }
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

    protected getDefaultImages(): ASoulDefaultPicResult[] {
        return [
            {img: 'https://i0.hdslb.com/bfs/album/e50ff4910f8e9f50638e5d00692736fe5382cd5f.jpg', tag: 'ava'},
            {img: 'https://i0.hdslb.com/bfs/album/5b8478af1cd42c4121195d6c970ef895e872c2d4.jpg', tag: 'bella'},
            {img: 'https://i0.hdslb.com/bfs/album/6b0225adb6da22810eab0343d04b54607a4cadef.jpg', tag: 'carol'},
            {img: 'https://i0.hdslb.com/bfs/album/49f2c78bf7153326f2fcd80b589111cb4054d053.jpg', tag: 'diana'},
            {img: 'https://i0.hdslb.com/bfs/album/052bad0f2525b44f5d00afb764d8fcae19798520.jpg', tag: 'eileen'}
        ]
    }

    protected getCaoImages(): ASoulDefaultPicResult[] {
        let uris = [
            'https://i0.hdslb.com/bfs/album/57ad5c6ac6e924066339065b0afb852f53da451d.png',
            'https://i0.hdslb.com/bfs/album/64d0c8eb810e17cf3e1194db771e82a75d484cad.png',

            'https://i0.hdslb.com/bfs/album/b43d6f55809060f4015f85028bcc04267c90b07f.gif',
            'https://i0.hdslb.com/bfs/album/6d6682adb6e6691e9e4fc1e16f9946a43031d3ae.gif',
            'https://i0.hdslb.com/bfs/album/06e0cf94f815dcd503bc7a06af66601545fada3b.gif',
            'https://i0.hdslb.com/bfs/album/d5d2fb54828ab5c582fdf4d362ea3ef67f511932.gif',
            'https://i0.hdslb.com/bfs/album/f7e3edf04f30e8bce3e5b1bb164aa2e363e18761.gif',
            'https://i0.hdslb.com/bfs/album/f41087048f5df564ff223a3b88f3ba12a6446962.gif',
            'https://i0.hdslb.com/bfs/album/91c27b71a9b65d3e344f11dcc1103633ed07beab.gif',
            'https://i0.hdslb.com/bfs/album/dfd12760220b806bda6d4cffb745eef711ce768a.gif'
        ];
        let results = [] as ASoulDefaultPicResult[]
        uris.forEach((uri, _, __) => {
            results.push({img: uri, tag: 'cao'});
        })
        return results;
    }

    protected getNiuImages(): ASoulDefaultPicResult[] {
        return [{ img: 'https://s3.bmp.ovh/imgs/2021/11/cd64f50b66155cb5.gif', tag: 'niuniu' }];
    }

    public getWebviewToolkitURI(): vscode.Uri {
        return vscode.Uri.file(path.join(this.context.extensionPath,
            "dist",
            "toolkit.min.js"
        ));
    }

    public getButtonJsURI(): vscode.Uri {
        return vscode.Uri.file(path.join(this.context.extensionPath,
            "dist",
            "button.min.js"
        ));
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
                { timeout: 8000 });
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
            name = this.NAME_OTHERS;
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

        if (title === "") {
            title = Utility.getConfiguration().get<string>('title', '');
        }
        return title;
    }

    public getCaoTitle(): string {
        let title = Utility.getConfiguration().get<string>('titleOfficial', '');
        if (title === "") {
            title = Utility.getConfiguration().get<string>('title', '');
        }
        return title;
    }
}
