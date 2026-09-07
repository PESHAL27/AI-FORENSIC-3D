export type NavigationTab = 'Home' | 'Investigation' | 'Scenarios' | 'Timeline' | 'Evidence' | 'Reports';

export interface EvidenceItem {
  id: string;
  number: string;
  label: string;
  description: string;
  confidence: string;
  type: string;
  coordinates: [number, number, number];
}

export interface CaseOption {
  id: string;
  title: string;
  status: string;
  date: string;
}

export interface FeatureItemData {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'cube' | 'branch' | 'search' | 'sliders' | 'target';
}
