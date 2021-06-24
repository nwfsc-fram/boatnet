import Settings from './src/settings';

export default {
  gitlab: {
    url: 'https://{{GL_HOST}}',
    token: '{{GL_TOKEN}}',
      projectId: {{GL_REPO_ID}},
  },
  github: {
    baseUrl: 'https://{{GH_HOST}}/api/v3',
    owner: '{{GH_ORG}}',
    token: '{{GH_TOKEN}}',
    repo: '{{REPO}}',
  },
 
  usermap: {
      'smontsaroff': 'smontsaroff',
	  'bhorness': 'smontsaroff',
	  'sogaz': 'smontsaroff',
	  'thay': 'smontsaroff',
	  'wsmith': 'smontsaroff',
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
      'fram-data/boatnet-etl': 'FRAMTesting/boatnet-etl',
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
