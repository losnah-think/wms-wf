import type { ThemeConfig } from 'antd'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`,
  },
  components: {
    Layout: {
      headerBg: '#001529',
      headerHeight: 64,
      headerPadding: '0 24px',
      headerColor: 'rgba(255, 255, 255, 0.85)',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#177ddc',
    },
    Card: {
      borderRadiusLG: 8,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    },
    Table: {
      borderRadiusLG: 8,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    },
  },
}

export default antdTheme
