
export type Protocol = 'http' | 'https';
export type AuthType = 'none' | 'basic' | 'api_key' | 'custom_token';
export type Method = 'GET' | 'POST';

export interface KeyValue {
  id: string;
  key: string;
  value: string;
}

export interface ResponseVariableMapping {
  id: string;
  jsonPath: string;     // e.g., "Session" or "data.access_token"
  variableName: string; // e.g., "token" or "SessionID"
}

export interface AuthConfig {
  // Basic Auth
  username?: string;
  password?: string;
  
  // API Key
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyPlacement?: 'header' | 'query';

  // Custom / Token (Generalizing for multiple vendors)
  loginUrl?: string; 
  responseVariables?: ResponseVariableMapping[]; // List of variables to extract from login response
  extraLoginParams?: string; // JSON string
}

export type FormatterType = 'none' | 'date_slash' | 'date_dash' | 'currency' | 'boolean_yn' | 'uppercase' | 'lowercase';

export interface FieldMapping {
  id: string;
  parameter?: string; // Alias/Variable Name for the Form (e.g., "VendorName")
  sourcePath: string; // JSON Key from API Response (e.g., "PayeeName")
  description?: string; // Human readable label
  formatter?: FormatterType; // Data transformation
}

export interface ApiCategory {
  id: string;
  name: string;
  allowedDepts: string[]; 
  allowedUsers: string[]; 
}

export interface ApiObject {
  id: string;
  dataSourceId: string;
  categoryId?: string;
  name: string;
  description?: string;
  method: Method;
  path: string;
  
  requestBodyTemplate?: string; 
  
  // Output
  responseRootPath?: string; 
  mappings: FieldMapping[];
}

export interface DataSource {
  id: string;
  name: string;
  host: string;
  port: string;
  protocol: Protocol;
  authType: AuthType;
  authConfig: AuthConfig;
  headers: KeyValue[]; 
}

// --- Form Designer Types ---

export type FormElementType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'section';

export interface FormElementOption {
    label: string;
    value: string;
}

export interface ApiBinding {
    apiObjectId: string;
    valueMappingId?: string;
    labelMappingId?: string;
    fillMappingId?: string;
}

export interface FormElement {
    id: string;
    type: FormElementType;
    label: string;
    fieldKey: string;
    placeholder?: string;
    required: boolean;
    description?: string;
    options?: FormElementOption[];
    width?: 'full' | 'half' | 'third';
    apiBinding?: ApiBinding;
}
