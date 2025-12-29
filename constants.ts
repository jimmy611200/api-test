
import { DataSource, ApiObject, ApiCategory } from './types';

// FlexSystem Template (Generalized)
export const FLEXSYSTEM_TEMPLATE: Partial<DataSource> = {
  protocol: 'http',
  port: '8033',
  authType: 'custom_token',
  headers: [
    { id: 'h_1', key: 'Content-Type', value: 'application/json' }
  ],
  authConfig: {
    loginUrl: '/Login',
    responseVariables: [
      { id: 'rv_1', jsonPath: 'Session', variableName: 'SessionID' }
    ],
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
      responseVariables: [
        { id: 'rv_1', jsonPath: 'Session', variableName: 'SessionID' }
      ],
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

export const INITIAL_CATEGORIES: ApiCategory[] = [
    { id: 'cat_1', name: '財務相關 (Finance)', allowedDepts: ['財務部', '會計部'], allowedUsers: [] },
    { id: 'cat_2', name: '人事行政 (HR/Admin)', allowedDepts: ['人資部'], allowedUsers: ['admin'] }
];

export const INITIAL_API_OBJECTS: ApiObject[] = [
  {
    id: 'obj_1',
    dataSourceId: 'ds_1',
    categoryId: 'cat_1',
    name: '供應商主檔 (Payee)',
    description: '取得所有供應商列表',
    method: 'POST',
    path: '/API',
    requestBodyTemplate: '{\n  "Session": "${SessionID}",\n  "ProgramID": "PaymentAPI",\n  "Action": "GetPayee",\n  "Data": { "LastUpdateDateRange": ["2025-07-21", "2025-07-21"] }\n}',
    responseRootPath: 'PayeeList',
    mappings: [
        { id: 'm_1', parameter: 'VendorID', sourcePath: 'PayeeCode', description: '供應商代碼' },
        { id: 'm_2', parameter: 'VendorName', sourcePath: 'PayeeName', description: '供應商名稱' },
        { id: 'm_3', parameter: 'Bank', sourcePath: 'BankDetails.BankName', description: '銀行名稱' },
        { id: 'm_4', parameter: 'TaxNo', sourcePath: 'TaxID', description: '統一編號' }
    ]
  }
];

export interface OrgNode {
    id: string;
    name: string;
    type: 'dept' | 'user';
    children?: OrgNode[];
}

export const MOCK_ORG_STRUCTURE: OrgNode[] = [
    {
        id: 'dept_mgt', name: '管理部', type: 'dept',
        children: [
            { id: 'admin', name: '系統管理員 (admin)', type: 'user' },
            { id: 'user_ceo', name: '執行長', type: 'user' }
        ]
    },
    {
        id: 'dept_fin', name: '財務部', type: 'dept',
        children: [
            { id: 'user_fin_mgr', name: '財務經理', type: 'user' },
            { id: 'user_fin_1', name: '會計專員 A', type: 'user' },
            { id: 'user_fin_2', name: '出納專員 B', type: 'user' }
        ]
    },
    {
        id: 'dept_hr', name: '人資部', type: 'dept',
        children: [
            { id: 'user_hr_mgr', name: '人資經理', type: 'user' },
            { id: 'user_hr_1', name: '招募專員', type: 'user' }
        ]
    },
    {
        id: 'dept_it', name: '資訊處', type: 'dept',
        children: [
            { id: 'team_dev', name: '系統開發組', type: 'dept', children: [
                { id: 'user_dev_1', name: '前端工程師', type: 'user' },
                { id: 'user_dev_2', name: '後端工程師', type: 'user' }
            ]},
            { id: 'team_inf', name: '基礎建設組', type: 'dept', children: [
                { id: 'user_inf_1', name: '網管工程師', type: 'user' }
            ]}
        ]
    }
];
