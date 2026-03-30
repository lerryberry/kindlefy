// Component utility interfaces

// Form components
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    children: React.ReactNode;
    onSubmit?: React.FormEventHandler<HTMLFormElement>;
    method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
    action?: string;
    encType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
    target?: '_self' | '_blank' | '_parent' | '_top';
    noValidate?: boolean;
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' | 'file' | 'range' | 'checkbox' | 'radio' | 'submit' | 'reset' | 'button' | 'hidden' | undefined;
    label?: string;
    required?: boolean;
    placeholder?: string;
    value?: string | number | readonly string[];
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    disabled?: boolean;
    readOnly?: boolean;
    autoComplete?: 'on' | 'off' | 'name' | 'email' | 'username' | 'current-password' | 'new-password' | 'one-time-code' | 'tel' | 'url' | 'street-address' | 'postal-code' | 'country' | 'language' | 'bday' | 'sex' | 'organization' | 'organization-title' | 'cc-name' | 'cc-given-name' | 'cc-family-name' | 'cc-number' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-csc' | 'cc-type' | 'transaction-amount' | 'transaction-currency';
    autoFocus?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    size?: number;
    step?: number;
    min?: number | string;
    max?: number | string;
    multiple?: boolean;
    accept?: string;
    capture?: 'user' | 'environment';
    form?: string;
    formAction?: string;
    formEncType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
    formMethod?: 'get' | 'post';
    formNoValidate?: boolean;
    formTarget?: '_self' | '_blank' | '_parent' | '_top';
    list?: string;
    name?: string;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    componentType?: 'input' | 'textarea';
    rows?: number;
}

// Button components
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    isWorking?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    children?: React.ReactNode;
}

export interface InlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isWorking?: boolean;
    children: React.ReactNode;
}

export interface ArrowButtonProps {
    direction: 'up' | 'down' | 'left' | 'right' | 'forward' | 'back';
    size?: 'small' | 'medium' | 'large';
    onClick?: () => void;
    disabled?: boolean;
}

// Dialog components
export interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
}

// Draggable components
export interface DraggableListItemProps {
    title?: string;
    onArrowClick?: () => void;
    children?: React.ReactNode;
}

// Status components
export interface StatusIndicatorProps {
    status: 'success' | 'error' | 'warning' | 'info' | 'loading';
    text?: string;
    size?: 'small' | 'medium' | 'large';
}

// Layout components
export interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export interface LoadingProps {
    text?: string;
    size?: 'small' | 'medium' | 'large';
}

// Stepper components
export interface StepperStep {
    id: string;
    title: string;
    description?: string;
    completed?: boolean;
    active?: boolean;
}

export interface StepperProps {
    steps: StepperStep[];
    currentStep?: number;
    onStepClick?: (step: StepperStep) => void;
    orientation?: 'horizontal' | 'vertical';
}

// Tab components
export interface TabProps {
    id: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
}

export interface TabsProps {
    tabs: TabProps[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    orientation?: 'horizontal' | 'vertical';
}

// Accordion components
export interface AccordionProps {
    title: string;
    children: React.ReactNode;
    isOpen?: boolean;
    onToggle?: () => void;
    disabled?: boolean;
}
