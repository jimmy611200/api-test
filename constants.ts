
import { DataSource, ApiObject } from './types';

// FlexSystem Template
export const FLEXSYSTEM_TEMPLATE: Partial<DataSource> = {
  protocol: 'http',
  port: '8033',
  authType: 'custom_token',
  headers: [
    { id: 'h_1', key: 'Content-Type', value: 'application/json' }
  ],
  authConfig: {
    loginUrl: '/Login',
    tokenField: 'Session',
    tokenVariable: 'SessionID',
    extraLoginParams: '{\n  "ClientVersion": "API"\n}',
    username: 'DEMO',
    password: ''
  }
};

export const INITIAL_DATA_SOURCES: DataSource[] = [
  {
    id: 'ds_1',
    name: 'FlexSystem ERP (Demo)',
    host: '127.0.0.1',
    port: '7019',
    protocol: 'http',
    authType: 'custom_token',
    headers: [
      { id: 'h_1', key: 'Content-Type', value: 'application/json; charset=utf-8' }
    ],
    authConfig: {
      username: 'DEMO',
      password: '',
      loginUrl: '/Login',
      tokenField: 'Session',
      tokenVariable: 'SessionID',
      extraLoginParams: '{\n  "ClientVersion": "API"\n}'
    }
  },
  {
    id: 'ds_2',
    name: 'HR System API',
    host: 'api.hr-system.com',
    port: '443',
    protocol: 'https',
    authType: 'api_key',
    headers: [
      { id: 'h_2', key: 'Accept', value: 'application/json' }
    ],
    authConfig: {
      apiKeyName: 'X-API-KEY',
      apiKeyValue: 'sk_test_12345',
      apiKeyPlacement: 'header'
    }
  }
];

export const INITIAL_API_OBJECTS: ApiObject[] = [
  {
    id: 'obj_1',
    dataSourceId: 'ds_1',
    name: '供應商主檔 (Payee)',
    description: '取得所有供應商列表',
    method: 'POST',
    path: '/API',
    requestBodyTemplate: '{\n  "Session": "${SessionID}",\n  "ProgramID": "PaymentAPI",\n  "Action": "GetPayee",\n  "Data": { "LastUpdateDateRange": [] }\n}',
    responseRootPath: 'PayeeList',
    mappings: [
        { id: 'm_1', sourcePath: 'PayeeCode', targetProperty: 'value' },
        { id: 'm_2', sourcePath: 'PayeeName', targetProperty: 'label' },
        { id: 'm_3', sourcePath: 'BankName', targetProperty: 'extra', targetExtraName: 'bank_name' }
    ]
  }
];
