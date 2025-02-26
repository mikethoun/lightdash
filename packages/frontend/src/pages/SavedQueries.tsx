import { Button } from '@blueprintjs/core';
import { Breadcrumbs2 } from '@blueprintjs/popover2';
import { subject } from '@casl/ability';
import { LightdashMode } from '@lightdash/common';
import { Stack } from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';
import { FC } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useParams } from 'react-router-dom';
import Page from '../components/common/Page/Page';
import {
    PageBreadcrumbsWrapper,
    PageHeader,
} from '../components/common/Page/Page.styles';
import ResourceView from '../components/common/ResourceView';
import {
    ResourceViewItemType,
    wrapResourceView,
} from '../components/common/ResourceView/resourceTypeUtils';
import { SortDirection } from '../components/common/ResourceView/ResourceViewList';
import { LoadingChart } from '../components/SimpleChart';
import { useSavedCharts } from '../hooks/useSpaces';
import { useApp } from '../providers/AppProvider';

const SavedQueries: FC = () => {
    const { projectUuid } = useParams<{ projectUuid: string }>();
    const { isLoading, data: savedQueries = [] } = useSavedCharts(projectUuid);

    const { user, health } = useApp();
    const cannotView = user.data?.ability?.cannot('view', 'SavedChart');

    const history = useHistory();
    const isDemo = health.data?.mode === LightdashMode.DEMO;

    const userCanManageCharts = user.data?.ability?.can(
        'manage',
        subject('SavedChart', {
            organizationUuid: user.data?.organizationUuid,
            projectUuid,
        }),
    );

    if (isLoading && !cannotView) {
        return <LoadingChart />;
    }

    const handleCreateChart = () => {
        history.push(`/projects/${projectUuid}/tables`);
    };

    return (
        <Page>
            <Helmet>
                <title>Saved charts - Lightdash</title>
            </Helmet>

            <Stack spacing="xl" w={900}>
                <PageHeader>
                    <PageBreadcrumbsWrapper>
                        <Breadcrumbs2
                            items={[
                                {
                                    href: '/home',
                                    text: 'Home',
                                    className: 'home-breadcrumb',
                                    onClick: (e) => {
                                        history.push('/home');
                                    },
                                },
                                {
                                    text: 'All saved charts',
                                },
                            ]}
                        />
                    </PageBreadcrumbsWrapper>

                    {savedQueries.length > 0 &&
                    !isDemo &&
                    userCanManageCharts ? (
                        <Button
                            icon="plus"
                            intent="primary"
                            onClick={handleCreateChart}
                        >
                            Create chart
                        </Button>
                    ) : undefined}
                </PageHeader>

                <ResourceView
                    items={wrapResourceView(
                        savedQueries,
                        ResourceViewItemType.CHART,
                    )}
                    listProps={{
                        defaultSort: { updatedAt: SortDirection.DESC },
                    }}
                    emptyStateProps={{
                        icon: <IconChartBar size={30} />,
                        title: 'No charts added yet',
                        action:
                            !isDemo && userCanManageCharts ? (
                                <Button
                                    icon="plus"
                                    intent="primary"
                                    onClick={handleCreateChart}
                                >
                                    Create chart
                                </Button>
                            ) : undefined,
                    }}
                />
            </Stack>
        </Page>
    );
};

export default SavedQueries;
