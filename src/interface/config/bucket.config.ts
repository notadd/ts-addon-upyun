
export interface BucketConfig {
    isPublic: boolean;

    name: string;

    operator: string;

    password: string;

    directory: string;

    requestExpire: number;

    base_url: string;

    tokenSecretKey?: string;

    tokenExpire?: number
}
