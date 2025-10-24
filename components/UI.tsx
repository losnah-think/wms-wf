import React from 'react'
import styles from './UI.module.css'

// ============================================================================
// 1. Card Component
// ============================================================================
export interface CardProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`${styles.card} ${className}`}>
      {title && <h3 className={styles.cardTitle}>{title}</h3>}
      <div className={styles.cardContent}>{children}</div>
    </div>
  )
}

// ============================================================================
// 2. StatCard Component
// ============================================================================
export interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`${styles.statCard} ${className}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      {subtitle && <div className={styles.statSubtitle}>{subtitle}</div>}
    </div>
  )
}

// ============================================================================
// 3. Badge Component
// ============================================================================
export interface BadgeProps {
  children: React.ReactNode
  type?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  type = 'default',
  className = ''
}) => {
  return (
    <span className={`${styles.badge} ${styles[`badge${type.charAt(0).toUpperCase() + type.slice(1)}`]} ${className}`}>
      {children}
    </span>
  )
}

// ============================================================================
// 4. Button Component
// ============================================================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`]}
        ${styles[`button${size.toUpperCase()}`]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// ============================================================================
// 5. Table Component
// ============================================================================
export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => React.ReactNode
}

export interface TableProps {
  columns: TableColumn[]
  data: any[]
  className?: string
}

export const Table: React.FC<TableProps> = ({ columns, data, className = '' }) => {
  return (
    <div className={`${styles.tableWrapper} ${className}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={styles[`align${column.align?.charAt(0).toUpperCase()}${column.align?.slice(1)}` || 'alignLeft']}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={styles[`align${column.align?.charAt(0).toUpperCase()}${column.align?.slice(1)}` || 'alignLeft']}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// 6. Section Component
// ============================================================================
export interface SectionProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
  className?: string
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  actions,
  className = ''
}) => {
  return (
    <section className={`${styles.section} ${className}`}>
      {(title || actions) && (
        <div className={styles.sectionHeader}>
          {title && <h2 className={styles.sectionTitle}>{title}</h2>}
          {actions && <div className={styles.sectionActions}>{actions}</div>}
        </div>
      )}
      <div className={styles.sectionContent}>{children}</div>
    </section>
  )
}

// ============================================================================
// 7. Grid Component
// ============================================================================
export interface GridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 2,
  gap = 'md',
  className = ''
}) => {
  return (
    <div
      className={`${styles.grid} ${styles[`gridCols${columns}`]} ${styles[`gap${gap.toUpperCase()}`]} ${className}`}
    >
      {children}
    </div>
  )
}

// ============================================================================
// 8. Input Component
// ============================================================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.inputLabel}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className={styles.inputErrorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// 9. Select Component
// ============================================================================
export interface SelectOption {
  value: string | number
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  className?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`${styles.selectWrapper} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.selectLabel}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`${styles.select} ${error ? styles.selectError : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${selectId}-error`} className={styles.selectErrorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// 10. SearchBar Component
// ============================================================================
export interface SearchBarProps {
  placeholder?: string
  onSearch: (value: string) => void
  defaultValue?: string
  className?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '검색...',
  onSearch,
  defaultValue = '',
  className = ''
}) => {
  const [value, setValue] = React.useState(defaultValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className={`${styles.searchBar} ${className}`}>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.searchInput}
        aria-label="검색"
      />
      <button type="submit" className={styles.searchButton} aria-label="검색 실행">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 19L14.65 14.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  )
}
