import { useEffect } from 'react';
import { ESewaAppBar, useESewaDataProvider } from 'esewa-ui-library';

const AppBar = () => {
  const { updateData } = useESewaDataProvider();

  useEffect(() => {
      updateData({
        title: "Merchant Product Form",
      });
    }, []);

  return (
    <ESewaAppBar 
      icon="icon-es-arrow-left"
      titleposition="left"
      onBackIconClick={() => console.log('Back icon clicked')}
      onTitleClick={() => console.log('Title clicked')}
      onActionIconClick={() => console.log('Action icon clicked')}
      actionIcon="icon-settings"
    />
  );
};

export default AppBar;

