/**
 * MenuGroupService - Organizes menu items into logical groups based on menu number ranges
 * 
 * Menu Range Organization:
 * 1-99: System
 * 100-200: Master
 * 200-300: Time Office
 * 300-400: Attendance/Leave
 * 400-500: Salary Wages
 * 500-600: Payroll
 * 600-700: Income Tax
 * 700-800: Visitor
 */

const MENU_GROUPS = [
  {
    groupId: 'system',
    groupName: 'System',
    icon: '🛠️',
    description: 'System Configuration',
    minRange: 1,
    maxRange: 99
  },
  {
    groupId: 'master',
    groupName: 'Master',
    icon: '⚙️',
    description: 'Master Data Management',
    minRange: 100,
    maxRange: 200
  },
  {
    groupId: 'time-office',
    groupName: 'Time Office',
    icon: '⏰',
    description: 'Time Tracking & Attendance',
    minRange: 201,
    maxRange: 300
  },
  {
    groupId: 'attendance-leave',
    groupName: 'Attendance/Leave',
    icon: '📅',
    description: 'Employee Attendance & Leave Management',
    minRange: 301,
    maxRange: 400
  },
  {
    groupId: 'salary-wages',
    groupName: 'Salary Wages',
    icon: '💳',
    description: 'Salary & Wage Calculations',
    minRange: 401,
    maxRange: 500
  },
  {
    groupId: 'payroll',
    groupName: 'Payroll',
    icon: '💵',
    description: 'Payroll Management',
    minRange: 501,
    maxRange: 600
  },
  {
    groupId: 'income-tax',
    groupName: 'Income Tax',
    icon: '💰',
    description: 'Income Tax Calculations',
    minRange: 601,
    maxRange: 700
  },
  {
    groupId: 'visitor',
    groupName: 'Visitor',
    icon: '👤',
    description: 'Visitor Management',
    minRange: 701,
    maxRange: 800
  }
];

/**
 * Get the menu group for a given menu number
 * @param {number} menuNumber - The menu number (mnuno)
 * @returns {Object|null} The menu group object or null if not found
 */
export const getMenuGroupByNumber = (menuNumber) => {
  return MENU_GROUPS.find(group => 
    menuNumber >= group.minRange && menuNumber <= group.maxRange
  ) || null;
};

/**
 * Organize menus into groups
 * @param {Array} menus - Array of menu items from the database
 * @param {Array} accessMenus - Array of menu numbers the user has access to
 * @returns {Array} Array of menu groups with organized menus
 */
export const organizeMenusByGroups = (menus = [], accessMenus = []) => {
  const groupedData = {};

  // Initialize all groups
  MENU_GROUPS.forEach(group => {
    groupedData[group.groupId] = {
      ...group,
      menus: []
    };
  });

  // Organize menus by group
  menus.forEach(menu => {
    const mnuno = menu.mnuno || 0;
    const group = getMenuGroupByNumber(mnuno);
    
    if (group) {
      // Only add menu if user has access and it's marked as not hidden (if such a field exists)
      if (accessMenus.includes(mnuno) || !accessMenus.length) {
        groupedData[group.groupId].menus.push(menu);
      }
    }
  });

  // Return only groups that have menus
  return Object.values(groupedData).filter(group => group.menus.length > 0);
};

/**
 * Get all menu groups configuration
 * @returns {Array} Array of all menu group configurations
 */
export const getAllMenuGroups = () => {
  return MENU_GROUPS;
};

/**
 * Get a specific menu group by ID
 * @param {string} groupId - The group ID (e.g., 'system', 'master')
 * @returns {Object|null} The menu group object or null
 */
export const getMenuGroupById = (groupId) => {
  return MENU_GROUPS.find(group => group.groupId === groupId) || null;
};

/**
 * Format menu data with additional properties
 * @param {Array} menus - Array of menu items
 * @returns {Array} Formatted menu items
 */
export const formatMenuData = (menus = []) => {
  return menus.map(menu => ({
    ...menu,
    mnuno: menu.mnuno || 0,
    mnuname: menu.mnuname || 'Unknown',
    filename: menu.filename || '#',
    mnutype: menu.mnutype || 'R',
    dashboard: menu.dashboard || '',
    group: getMenuGroupByNumber(menu.mnuno || 0)
  }));
};

/**
 * Filter menus based on user dashboard assignment
 * @param {Array} menus - Array of menu items
 * @param {string|number} userDashboard - The user's assigned dashboard
 * @returns {Array} Filtered menus
 */
export const filterMenusByDashboard = (menus = [], userDashboard = '') => {
  if (!userDashboard) return menus;
  
  return menus.filter(menu => {
    const dashboard = menu.dashboard || '';
    return dashboard.includes(String(userDashboard));
  });
};

/**
 * Search through menu groups
 * @param {Array} groupedMenus - Array of organized menu groups
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered menu groups matching the search
 */
export const searchMenuGroups = (groupedMenus = [], searchTerm = '') => {
  if (!searchTerm.trim()) return groupedMenus;

  const lowerSearchTerm = searchTerm.toLowerCase();

  return groupedMenus
    .map(group => {
      // Check if group name matches
      const groupMatches = group.groupName.toLowerCase().includes(lowerSearchTerm);
      
      // Check if any menus match
      const matchingMenus = group.menus.filter(menu =>
        menu.mnuname?.toLowerCase().includes(lowerSearchTerm) ||
        menu.filename?.toLowerCase().includes(lowerSearchTerm)
      );

      // Return group with matching menus or if group name matches
      if (groupMatches) {
        return group;
      } else if (matchingMenus.length > 0) {
        return {
          ...group,
          menus: matchingMenus
        };
      }

      return null;
    })
    .filter(group => group !== null);
};

export default {
  getMenuGroupByNumber,
  organizeMenusByGroups,
  getAllMenuGroups,
  getMenuGroupById,
  formatMenuData,
  filterMenusByDashboard,
  searchMenuGroups
};
