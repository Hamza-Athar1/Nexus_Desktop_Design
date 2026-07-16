export default function SuperAdminPlaceholderPage({ tab }) {
  const titles = {
    users: 'User Management',
    billing: 'Billing',
    payment: 'Payment',
    profile: 'Profile Management',
    pos: 'POS management',
  };
  const title = titles[tab] || 'Management';

  return (
    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#bfbc9b] rounded-3xl bg-[#efeacb]/40 p-10 text-center">
      <h2 className="text-2xl font-bold font-serif text-[#152f16] mb-2 uppercase">
        {title}
      </h2>
      <p className="text-[#607455] max-w-md">
        The {title} section is currently set up under the system admin scope. Access can be extended dynamically.
      </p>
    </div>
  );
}
