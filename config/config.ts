import * as pulumi from '@pulumi/pulumi';

export interface IConfig {
    env: EnvName;
    region: string;
    subscriptionId: string;
}

class EnvName {
    get lowerCase(): string {
        return this._env.toLowerCase();
    }

    get upperCase(): string {
        return this._env.toUpperCase();
    }

    get pascalCase(): string {
        const first = this._env.charAt(0);
        const rest = this._env.slice(1);
        return first.toUpperCase() + rest.toLowerCase();
    }

    private _env: string;

    constructor(env: string) {
        this._env = env;
    }
}

class Config implements IConfig {
    get env(): EnvName {
        const env = this._config.require('env');
        return new EnvName(env);
    }

    get region(): string {
        return this._config.require('region');
    }

    get subscriptionId(): string {
        return this._config.require('subscriptionId');
    }

    private _config: pulumi.Config;

    constructor() {
        this._config = new pulumi.Config();
    }
}

export function createConfig(): IConfig {
    return new Config();
}
