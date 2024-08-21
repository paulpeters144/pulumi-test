import * as azureNative from '@pulumi/azure-native';
import { Output } from '@pulumi/pulumi';
import { IConfig } from '../config/config';

export interface IResourceGroup {
    name: Output<string>;
    location: Output<string>;
    id: Output<string>;
    subscriptionId: Output<string>;
}

class ResourceGroup implements IResourceGroup {
    get name(): Output<string> {
        return this._value.name;
    }

    get location(): Output<string> {
        return this._value.location;
    }

    get id(): Output<string> {
        return this._value.id;
    }

    get subscriptionId(): Output<string> {
        return this._value.id.apply((id) => id.split('/')[2]);
    }

    private _value: azureNative.resources.ResourceGroup;

    constructor(config: IConfig) {
        const name = `pulumi-test-group-${config.env.lowerCase}`;
        this._value = new azureNative.resources.ResourceGroup(name, {
            location: config.region,
            resourceGroupName: name,
        });
    }
}

interface ResourceGroupProps {
    config: IConfig;
}

export function createResourceGroup({ config }: ResourceGroupProps): IResourceGroup {
    return new ResourceGroup(config);
}
