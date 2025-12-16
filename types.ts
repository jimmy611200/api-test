
export type Protocol = 'http' | 'https';
export type AuthType = 'none' | 'basic' | 'api_key' | 'custom_token';
export type Method = 'GET' | 'POST';

export interface KeyValue {
  id: string;
  key: string;
  value: string;
}

export interface AuthConfig {
  // Basic Auth
  username?: string;
  password?: string;
  
  // API Key
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyPlacement?: 'header' | 'query';

  // Custom / Token (e.g. FlexSystem)
  loginUrl?: string; 
  tokenField?: string; // Path to token in login response (e.g., Session)
  tokenVariable?: string; // Variable name (e.g., SessionID)
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
  allowedDepts: string[]; // Mock List of Department IDs/Names
  allowedUsers: string[]; // Mock List of User IDs/Names
}

export interface ApiObject {
  id: string;
  dataSourceId: string; // Link to DataSource
  categoryId?: string; // Link to ApiCategory
  name: string; // e.g., 供應商主檔
  description?: string;
  method: Method;
  path: string; // e.g., /API
  
  requestBodyTemplate?: string; // JSON string with placeholders like ${SessionID} or ${DeptID}
  
  // Output
  responseRootPath?: string; // e.g., PayeeList
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
  headers: KeyValue[]; // Global headers like Content-Type
}

// --- Form Designer Types ---

export type FormElementType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'section';

export interface FormElementOption {
    label: string;
    value: string;
}

export interface ApiBinding {
    apiObjectId: string; // Which API to call
    
    // For Select/Radio/Checkbox (List Data)
    valueMappingId?: string; // Which mapping provides the 'value'
    labelMappingId?: string; // Which mapping provides the 'label'

    // For Text/Number/Date (Single Data Fill)
    fillMappingId?: string; // Which mapping provides the value to fill
}

export interface FormElement {
    id: string;
    type: FormElementType;
    label: string;
    fieldKey: string; // unique key for data binding
    placeholder?: string;
    required: boolean;
    description?: string;
    options?: FormElementOption[]; // For select, radio, checkbox (Manual options)
    width?: 'full' | 'half' | 'third';
    
    // New: Binding Config
    apiBinding?: ApiBinding;
}
