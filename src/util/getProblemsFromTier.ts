import axios from 'axios';

function getPrefix(tier: number) {
  if (tier <= 5) return 'b';
  if (tier <= 10) return 's';
  if (tier <= 15) return 'g';
  if (tier <= 20) return 'p';
  if (tier <= 25) return 'd';
  return 'r';
}

function getPostfix(tier: number) {
  if (tier % 10 > 5) {
    return (tier % 10) - 5;
  }
  return tier % 10;
}

export interface ProblemAPIInterface {
  id: number;
  level: number;
  solvable: number;
  title: string;
  solved_count: number;
  average_try: number;
}

interface getProblemsBetweenTierResponse {
  success: boolean;
  result: {
    total_problems: number;
    total_page: number;
    problems: ProblemAPIInterface[];
  };
}

export async function getProblemsBetweenTier(min: number, max: number) {
  let url = `https://api.solved.ac/v2/search/problems.json?query=tier:${getPrefix(min)}${getPostfix(min)}..${getPrefix(max)}${getPostfix(max)}+&page=1&sort=random&sort_direction=asc`;
  const response = await axios.get<getProblemsBetweenTierResponse>(url);
  return response.data;
}
