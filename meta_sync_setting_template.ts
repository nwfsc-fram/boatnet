import Settings from './src/settings';

export default {
  gitlab: {
    url: 'https://{{SRC_HOST}}',
    token: '{{SRC_TOKEN}}',
      projectId: {{SRC_REPO_ID}},
  },
  github: {
    baseUrl: 'https://{{TARG_HOST}}/api/v3',
    owner: '{{TARG_ORG}}',
    token: '{{TARG_TOKEN}}',
    repo: '{{REPO}}',
  },
 
  usermap: {
      'smontsaroff': 'smontsaroff',
	  'bhorness': 'fram-jenkins',
	  'sogaz': 'fram-jenkins',
	  'thay': 'fram-jenkins',
	  'wsmith': 'fram-jenkins',
	  'nshaffer': 'nshaffer',
	  'mshak': 'mshak',
	  'kselton': 'kselton',
	  'jfellows': 'jfellows',
	  'cwhitmire': 'cwhitmire',
	  'avizek': 'avizek',
	  'esteiner': 'esteiner',
	  'abillings': 'abillings',
	  'Neil.Riley':'nriley',
	  'sahmad': 'sahmad',
  },
  projectmap: {
      '{{SRC_ORG}}/{{REPO}}': '{{TARG_ORG}}/{{REPO}}',
  },
  conversion: {
    useLowerCaseLabels: true,
  },
  transfer: {
    milestones: true,
    labels: true,
    issues: true,
    mergeRequests: true,
  },
  debug: false,
  usePlaceholderIssuesForMissingIssues: true,
  useReplacementIssuesForCreationFails: true,
  useIssuesForAllMergeRequests: false,
  filterByLabel: null,
  skipMatchingComments: [],
  mergeRequests: {
    logFile: './merge-requests.json',
    log: false,
  },
} as Settings;
