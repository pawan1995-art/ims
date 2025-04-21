import { Col, Row } from 'antd';

interface Props {
  name: string;
  errors?: Record<string, any>;
  label: string;
  type?: string;
  register: any;
  required?: boolean;
  defaultValue?: any;
}

const CustomInput = ({
  name,
  errors = {},
  required = false,
  label,
  register,
  type = 'text',
}: Props) => {
  // Validation rules: if this is the contactNo field, enforce exactly 10 digits
  const validationRules = {
    required: required && `${label} is required`,
    ...(name === 'contactNo' && {
      pattern: {
        value: /^\d{10}$/,
        message: `${label} must be a 10-digit number`,
      },
      maxLength: {
        value: 10,
        message: `${label} cannot exceed 10 digits`,
      },
      minLength: {
        value: 10,
        message: `${label} must be exactly 10 digits`,
      },
    }),
  };

  return (
    <Row gutter={[16, 8]} align="middle">
      <Col xs={{ span: 23 }} lg={{ span: 6 }}>
        <label htmlFor={name} className="label">
          {label}
        </label>
      </Col>
      <Col xs={{ span: 23 }} lg={{ span: 18 }}>
        <input
          id={name}
          type={type === 'text' && name === 'contactNo' ? 'tel' : type}
          inputMode={name === 'contactNo' ? 'numeric' : undefined}
          maxLength={name === 'contactNo' ? 10 : undefined}
          placeholder={label}
          {...register(name, validationRules)}
          className={`input-field ${errors[name] ? 'input-field-error' : ''}`}
          onInput={
            name === 'contactNo'
              ? (e: React.FormEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value.replace(/\D/g, '');
                  e.currentTarget.value = value.slice(0, 10);
                }
              : undefined
          }
        />
        {errors[name] && (
          <p className="error-message">{errors[name].message}</p>
        )}
      </Col>
    </Row>
  );
};

export default CustomInput;