export const usePremiseGroupDeletion = () => {
  const { delete: deleteStrapi } = useStrapi();

  const deletePremiseGroupForNode = async (node: any) => {
    const nodeDeleteId = node?.documentId ?? node?.id;
    if (nodeDeleteId) await deleteStrapi("nodes", nodeDeleteId);
  };

  return { deletePremiseGroupForNode };
};
