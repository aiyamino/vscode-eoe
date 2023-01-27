import * as vscode from 'vscode';
import axios from 'axios'
import { Utility } from './utility';

export interface EOETag {
    tag_id: number
    tag_title: string
}
export interface EOEOwner {
    name: string
    uid: number
}

export interface EOEGetRandomPicResultContent {
    img_height: number,
    img_size: number,
    img_width: number,
    img_src: string
}
export interface EOEGetRandomPicResultRaw {
    code: number,
    message: string,
    ttl: number,
    data: EOEGetRandomPicResultContent
}

export interface EOEGetRandomPicResult {
    img: string,
    dy_url: string,
    tags: EOETag[],
    owner: EOEOwner
}
export interface EOEDefaultPicResult {
    img: string,
    tag: string
}
export type ImageSource = EOEGetRandomPicResult | EOEDefaultPicResult | vscode.Uri | string
export function isEOEGetRandomPicResult(source: ImageSource): source is EOEGetRandomPicResult {
    const result = source as EOEGetRandomPicResult;
    return result.img !== undefined && result.dy_url !== undefined && result.tags !== undefined;
}
export function isEOEDefaultPicResult(source: ImageSource): source is EOEDefaultPicResult {
    const result = source as EOEDefaultPicResult;
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
    public readonly TYPE_KUOYU = "kuoyu";
    public readonly TYPE_MIX = "mix";

    public readonly NAME_WANER = 'waner';
    public readonly NAME_LUZAO = 'luzao';
    public readonly NAME_MINUO = 'minuo';
    public readonly NAME_YUMO = 'yumo';
    public readonly NAME_YOUEN = 'youen';
    public readonly NAME_OTHERS = 'others';

    public async getImageUri(): Promise<ImageSource> {
        const type: string = this.getConfigType();
        let images: ImageSource[];

        if (type === this.TYPE_RANDOM) {
            images = await this.getRandomImages();
        } else if (type === this.TYPE_URL_IMAGE) {
            images = this.getCustomImages();
        } else if (type === this.TYPE_KUOYU) {
            images = this.getKuoYuImages();
        } else if (type === this.TYPE_MIX) {
            // generate random number from 0 to 100
            let random = Math.floor(Math.random() * 100);
            if (random < 90) {
                images = await this.getRandomImages();
            } else {
                images = this.getKuoYuImages();
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

    protected getDefaultImages(): EOEDefaultPicResult[] {
        return [
            {img: 'https://i0.hdslb.com/bfs/new_dyn/23459c97ba2a215ae4357e0fe3494e251875044092.jpg', tag: 'waner'},
            {img: 'https://i0.hdslb.com/bfs/new_dyn/adcb8ae89f0268e4037bc4e6c3db97ca1669777785.jpg', tag: 'luzao'},
            {img: 'https://i0.hdslb.com/bfs/new_dyn/c8f317eb530f02dd187520ad8773f1a31778026586.jpg', tag: 'minuo'},
            {img: 'https://i0.hdslb.com/bfs/new_dyn/c506da3d4d6d34c242c7ddd7ecf924741811071010.jpg', tag: 'yumo'},
            {img: 'https://i0.hdslb.com/bfs/new_dyn/b463d650abe6c104a0fe73bc87d5f7491795147802.jpg', tag: 'youen'}
        ]
    }

    protected getKuoYuImages(): EOEDefaultPicResult[] {
        let uris = [
            'https://i0.hdslb.com/bfs/album/176830e500f7e00098d74a2613f56db7adaa15fb.jpg'
        ];
        let results = [] as EOEDefaultPicResult[]
        uris.forEach((uri, _, __) => {
            results.push({img: uri, tag: 'kuoyu'});
        })
        return results;
    }

    protected getConfigType(): string {
        return Utility.getConfiguration().get<string>('type', 'random');
    }

    protected getCustomImages() {
        return Utility.getConfiguration().get<string[]>('customImages', []);
    }

    public async getRandomImages() {
        try {
            const response = await axios.get<EOEGetRandomPicResultRaw>(
                "https://api.eoe.best/eoefans-api/v1/pic/random?subscription-key=3cc4284fbb864965a7a9ad0f28af8496",
                { timeout: 8000 }) as EOEGetRandomPicResultRaw;
            let return_item = {} as EOEGetRandomPicResult
            return_item.img = response.data.img_src
            return_item.dy_url = "https://www.bilibili.com"
            return [return_item]
        } catch (err) {
            return [] as EOEGetRandomPicResult[];
        }
    }

    public getTitle(): string {
        return Utility.getConfiguration().get<string>('title', '');
    }

    public getName(tags: EOETag[]): string {
        let tagsCnt = 0;
        let name = this.NAME_OTHERS;
        tags.forEach(element => {
            if (element.tag_title.includes('莞儿') && name != this.NAME_WANER) {
                tagsCnt++;
                name = this.NAME_WANER;
            }
            if (element.tag_title.includes('露早') && name != this.NAME_LUZAO) {
                tagsCnt++;
                name = this.NAME_LUZAO;
            }
            if (element.tag_title.includes('米诺') && name != this.NAME_MINUO) {
                tagsCnt++;
                name = this.NAME_MINUO;
            }
            if (element.tag_title.includes('虞莫') && name != this.NAME_YUMO) {
                tagsCnt++;
                name = this.NAME_YUMO;
            }
            if (element.tag_title.includes('柚恩') && name != this.NAME_YOUEN) {
                tagsCnt++;
                name = this.NAME_YOUEN;
            }
        });
        if (tagsCnt != 1) {
            name = this.NAME_OTHERS;
        }
        return name;
    }

    public getNameFromUri(uri: vscode.Uri): string {
        let name = this.NAME_OTHERS;
        if (uri.path.includes('waner')) {
            name = this.NAME_WANER;
        }
        if (uri.path.includes('luzao')) {
            name = this.NAME_LUZAO;
        }
        if (uri.path.includes('minuo')) {
            name = this.NAME_MINUO;
        }
        if (uri.path.includes('yumo')) {
            name = this.NAME_YUMO;
        }
        if (uri.path.includes('youen')) {
            name = this.NAME_YOUEN;
        }
        return name;
    }

    public getNamedTitle(name: string): string {
        let title = "";
        if (name === this.NAME_WANER) {
            title = Utility.getConfiguration().get<string>('titleWanEr', '');
        } else if (name === this.NAME_LUZAO) {
            title = Utility.getConfiguration().get<string>('titleLuZao', '');
        } else if (name === this.NAME_MINUO) {
            title = Utility.getConfiguration().get<string>('titleMiNuo', '');
        } else if (name === this.NAME_YUMO) {
            title = Utility.getConfiguration().get<string>('titleYuMo', '');
        } else if (name === this.NAME_YOUEN) {
            title = Utility.getConfiguration().get<string>('titleYouEn', '');
        }

        if (title === "") {
            title = Utility.getConfiguration().get<string>('title', '');
        }
        return title;
    }

    public getKuoYuTitle(): string {
        let title = Utility.getConfiguration().get<string>('titleOfficial', '');
        if (title === "") {
            title = Utility.getConfiguration().get<string>('title', '');
        }
        return title;
    }

    public static isWebContext(): boolean {
        return vscode.env.appHost != 'desktop';
    }
}
