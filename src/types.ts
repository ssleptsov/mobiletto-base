import { CacheLike } from "./cache";
import { MobilettoEntryType } from "mobiletto-common";
import { ReadStream } from "fs";
import fs from "fs";
import { Readable, Transform } from "stream";

export type MobilettoRedisConfig = {
    host?: string;
    port?: number;
    prefix?: string;
    enabled?: boolean;
};

export type MobilettoOptions = {
    readOnly?: boolean;
    redisConfig: MobilettoRedisConfig;
};

export type MobilettoConnectionFunction = (key: string, secret: string, opts: MobilettoOptions) => MobilettoConnection;

export type MobilettoDriver = {
    storageClient: MobilettoConnectionFunction;
};

export type MobilettoDriverParameter = MobilettoConnectionFunction | MobilettoDriver;

export type MobilettoMetadata = {
    name: string;
    type: MobilettoEntryType;
    size?: number;
    ctime?: number;
    mtime?: number;
};

export type MobilettoVisitor = (meta: MobilettoMetadata) => Promise<unknown>;

export type MobilettoListOptions = {
    recursive?: boolean;
    visitor?: MobilettoVisitor;
};

export type MobilettoRemoveOptions = {
    recursive?: boolean;
    quiet?: boolean;
};

export type MobilettoMirrorResults = {
    success: number;
    errors: number;
};

export type MobilettoReadFunc = { next: () => { value: Buffer } };
export type MobilettoByteCounter = { count: number };
export type MobilettoWriteSource = Buffer | string | MobilettoGenerator | ReadStream;

export type MobilettoReadable = fs.ReadStream | Transform | Readable;
export type MobilettoGenerator = Generator<Buffer | string, void>;

/* eslint-disable @typescript-eslint/no-explicit-any */
export type MobilettoPatchable = {
    [func: string]: any;
};
export type MobilettoFunctions = Record<string, (client: MobilettoMinimalClient) => (...params: any[]) => any>;
export type MobilettoConflictFunction = (m: MobilettoMinimalClient, s: string) => boolean;
/* eslint-enable @typescript-eslint/no-explicit-any */

export type MobilettoMinimalClient = MobilettoPatchable & {
    list: (
        pth?: string,
        optsOrRecursive?: MobilettoListOptions | boolean,
        visitor?: MobilettoVisitor
    ) => Promise<MobilettoMetadata[]>;
    metadata: (path: string) => Promise<MobilettoMetadata>;
    read: (path: string, callback: (chunk: Buffer) => void, endCallback?: () => void) => Promise<number>;
    write: (path: string, data: MobilettoWriteSource) => Promise<number>;
    remove: (
        path: string,
        optsOrRecursive?: MobilettoRemoveOptions | boolean,
        quiet?: boolean
    ) => Promise<string | string[]>;
};

export type MobilettoConnection = MobilettoMinimalClient & {
    testConfig: () => unknown;
    safeList: (path?: string, opts?: MobilettoListOptions) => Promise<MobilettoMetadata[]>;
    safeMetadata: (path: string) => Promise<MobilettoMetadata | null>;
    readFile: (path: string) => Promise<Buffer>;
    safeReadFile: (path: string) => Promise<Buffer | null>;
    writeFile: (path: string, data: MobilettoWriteSource) => Promise<number>;
    mirror: (source: MobilettoConnection, clientPath: string, sourcePath: string) => Promise<MobilettoMirrorResults>;
};

export type MobilettoClient = MobilettoConnection & {
    id?: string;
    redisConfig: MobilettoRedisConfig;
    cache: CacheLike;
    redis: () => CacheLike;
    scopedCache: (cacheName: string, size?: number) => CacheLike;
    flush: () => Promise<void>;
    driver_list: (path?: string, recursive?: boolean, visitor?: MobilettoVisitor) => Promise<MobilettoMetadata[]>;
    driver_write: (path: string, data: MobilettoWriteSource) => Promise<number>;
    driver_metadata: (path: string) => Promise<MobilettoMetadata>;
    driver_remove: (path: string, recursive?: boolean, quiet?: boolean) => Promise<string | string[]>;
};
