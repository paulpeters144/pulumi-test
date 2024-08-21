import * as azureNative from '@pulumi/azure-native';
import { IResourceGroup } from './resource-group';
import { IConfig } from '../config/config';
import { Output } from '@pulumi/pulumi';

export interface IVirtualNetwork {
    subnetId: Output<string>;
}

class VirtualNetwork {
    get subnetId(): Output<string> {
        return this._subnetValue.id;
    }
    private _virtualNetworkValue: azureNative.network.VirtualNetwork;
    private _subnetValue: azureNative.network.Subnet;
    private _securityGroupValue: azureNative.network.NetworkSecurityGroup;

    constructor({ config, resourceGroup }: VirtualNetworkProps) {
        const vnetName = `pulumi-vnet-${config.env.lowerCase}`;
        this._virtualNetworkValue = new azureNative.network.VirtualNetwork(vnetName, {
            addressSpace: {
                addressPrefixes: ['10.0.0.0/16'],
            },
            location: config.region,
            resourceGroupName: resourceGroup.name,
            virtualNetworkName: vnetName,
        });

        const sgName = `pulumi-sg1-${config.env.lowerCase}`;
        this._securityGroupValue = new azureNative.network.NetworkSecurityGroup(sgName, {
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            networkSecurityGroupName: sgName,
            securityRules: [
                {
                    name: 'AllowSSH',
                    priority: 1000,
                    direction: 'Inbound',
                    access: 'Allow',
                    protocol: 'Tcp',
                    sourcePortRange: '*',
                    destinationPortRange: '22',
                    sourceAddressPrefix: '*',
                    destinationAddressPrefix: '*',
                },
                {
                    name: 'AllowHTTP',
                    priority: 1001,
                    direction: 'Inbound',
                    access: 'Allow',
                    protocol: 'Tcp',
                    sourcePortRange: '*',
                    destinationPortRange: '80',
                    sourceAddressPrefix: '*',
                    destinationAddressPrefix: '*',
                },
            ],
        });

        const subNetName = `pulumi-subnet1-${config.env.lowerCase}`;
        this._subnetValue = new azureNative.network.Subnet(subNetName, {
            resourceGroupName: resourceGroup.name,
            virtualNetworkName: this._virtualNetworkValue.name,
            addressPrefix: '10.0.2.0/23',
            subnetName: subNetName,
            networkSecurityGroup: {
                id: this._securityGroupValue.id,
            },
        });
    }
}

interface VirtualNetworkProps {
    config: IConfig;
    resourceGroup: IResourceGroup;
}

export function createVirtualNetwork({
    config,
    resourceGroup,
}: VirtualNetworkProps): IVirtualNetwork {
    return new VirtualNetwork({ config, resourceGroup });
}
