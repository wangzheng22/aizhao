import { useState } from 'react';
import { projectListMock } from '../data/projectListMock';
import type { ProjectListItem } from '../types/projectList';
import './ProjectListPage.css';

const FIGMA_HOME = `${import.meta.env.BASE_URL}figma-home`;
const FIGMA_HOME_ASSET_V = '3';

const PRIMARY_NAV = [
  '首页',
  '租户管理',
  '用户管理',
  '字段库',
  '技能库',
  '规则库',
  '字典管理',
] as const;

type PrimaryNavItem = (typeof PRIMARY_NAV)[number];

type ProjectListPageProps = {
  onOpenProject: (item: ProjectListItem) => void;
  onCreateNew: () => void;
  onStartReview: () => void;
};

function projectListBadge(item: ProjectListItem): '编' | '审' {
  return item.hasGeneratedDocument ? '编' : '审';
}

export function ProjectListPage({
  onOpenProject,
  onCreateNew,
  onStartReview,
}: ProjectListPageProps) {
  const [activeNav, setActiveNav] = useState<PrimaryNavItem>('首页');

  return (
    <div className="project-list-page">
      <header className="project-list-page__topbar">
        <div className="project-list-page__topbar-inner">
          <span className="project-list-page__brand-text">智能编审</span>
          <nav className="project-list-page__nav" aria-label="一级菜单">
            {PRIMARY_NAV.map((label) => {
              const active = activeNav === label;
              return (
                <button
                  key={label}
                  type="button"
                  className={[
                    'project-list-page__nav-item',
                    active ? 'project-list-page__nav-item--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setActiveNav(label)}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="project-list-page__main">
        <section className="project-list-page__welcome" aria-labelledby="project-list-welcome-title">
          <div className="project-list-page__welcome-logo-wrap" aria-hidden="true">
            <img
              className="project-list-page__welcome-logo"
              src={`${FIGMA_HOME}/welcome-logo.png?v=${FIGMA_HOME_ASSET_V}`}
              alt=""
              width={57}
              height={50}
              decoding="async"
            />
          </div>
          <div className="project-list-page__welcome-copy">
            <p className="project-list-page__welcome-title" id="project-list-welcome-title">
              <span className="project-list-page__welcome-prefix">欢迎体验</span>
              <span className="project-list-page__welcome-accent">智能编审</span>
            </p>
            <p className="project-list-page__welcome-sub">智赋招采，文审清源，依规成稿</p>
          </div>
        </section>

        <section className="project-list-page__entries" aria-label="快速入口">
          <div className="project-list-page__entries-box">
            <button
              type="button"
              className="project-list-page__entry-card project-list-page__entry-card--create"
              onClick={onCreateNew}
            >
              <div className="project-list-page__entry-body">
                <img
                  className="project-list-page__entry-leading"
                  src={`${FIGMA_HOME}/entry-create-add.svg?v=${FIGMA_HOME_ASSET_V}`}
                  alt=""
                  width={47}
                  height={47}
                  decoding="async"
                />
                <div className="project-list-page__entry-text">
                  <span className="project-list-page__entry-title">新建招标文件</span>
                  <span className="project-list-page__entry-desc">上传资料，一键成稿</span>
                </div>
              </div>
              <img
                className="project-list-page__entry-illus"
                src={`${FIGMA_HOME}/entry-create-illus.png?v=${FIGMA_HOME_ASSET_V}`}
                alt=""
                width={100}
                height={100}
                decoding="async"
              />
            </button>
            <button
              type="button"
              className="project-list-page__entry-card project-list-page__entry-card--review"
              onClick={onStartReview}
            >
              <div className="project-list-page__entry-body">
                <img
                  className="project-list-page__entry-leading"
                  src={`${FIGMA_HOME}/entry-review-leading.svg?v=${FIGMA_HOME_ASSET_V}`}
                  alt=""
                  width={47}
                  height={47}
                  decoding="async"
                />
                <div className="project-list-page__entry-text">
                  <span className="project-list-page__entry-title">审查招标文件</span>
                  <span className="project-list-page__entry-desc">上传标书，智能扫描</span>
                </div>
              </div>
              <img
                className="project-list-page__entry-illus"
                src={`${FIGMA_HOME}/entry-review-illus.png?v=${FIGMA_HOME_ASSET_V}`}
                alt=""
                width={100}
                height={100}
                decoding="async"
              />
            </button>
          </div>
        </section>

        <section className="project-list-page__projects" aria-label="项目列表">
          <h2 className="project-list-page__projects-title">我的项目</h2>
          <div className="project-list-page__project-table-wrap">
            <div className="project-list-page__project-table" role="table" aria-label="项目列表表格">
              <div className="project-list-page__project-table-head" role="row">
                <span className="project-list-page__project-col project-list-page__project-col--type" role="columnheader">
                  类型
                </span>
                <span className="project-list-page__project-col project-list-page__project-col--name" role="columnheader">
                  项目名称
                </span>
                <span className="project-list-page__project-col" role="columnheader">
                  行业
                </span>
                <span className="project-list-page__project-col" role="columnheader">
                  专业
                </span>
                <span className="project-list-page__project-col" role="columnheader">
                  招标人
                </span>
                <span className="project-list-page__project-col project-list-page__project-col--compact" role="columnheader">
                  招标方式
                </span>
                <span className="project-list-page__project-col project-list-page__project-col--compact" role="columnheader">
                  资格审查
                </span>
                <span className="project-list-page__project-col project-list-page__project-col--time" role="columnheader">
                  更新时间
                </span>
                <span className="project-list-page__project-col project-list-page__project-col--action" role="columnheader">
                  操作
                </span>
              </div>
              <ul className="project-list-page__project-rows">
                {projectListMock.map((item) => {
                  const badge = projectListBadge(item);
                  const actionLabel = badge === '编' ? '编制文件' : '审查文件';
                  return (
                    <li key={item.id} className="project-list-page__project-row" role="row">
                      <span
                        className={[
                          'project-list-page__project-badge',
                          badge === '审'
                            ? 'project-list-page__project-badge--review'
                            : 'project-list-page__project-badge--edit',
                        ].join(' ')}
                        title={badge === '编' ? '编制' : '审查'}
                      >
                        {badge}
                      </span>
                      <div className="project-list-page__project-name-cell" role="cell">
                        <span className="project-list-page__project-name" title={item.projectName}>
                          {item.projectName}
                        </span>
                        <span className="project-list-page__project-code">{item.projectCode}</span>
                      </div>
                      <span className="project-list-page__project-cell" title={item.industryType} role="cell">
                        {item.industryType}
                      </span>
                      <span className="project-list-page__project-cell" title={item.specialtyType} role="cell">
                        {item.specialtyType}
                      </span>
                      <span className="project-list-page__project-cell" title={item.tenderer} role="cell">
                        {item.tenderer}
                      </span>
                      <span className="project-list-page__project-cell project-list-page__project-cell--compact" role="cell">
                        {item.bidMethod}
                      </span>
                      <span className="project-list-page__project-cell project-list-page__project-cell--compact" role="cell">
                        {item.qualificationReview}
                      </span>
                      <time
                        className="project-list-page__project-cell project-list-page__project-cell--time"
                        dateTime={item.updatedAt}
                        role="cell"
                      >
                        {item.updatedAt}
                      </time>
                      <div className="project-list-page__project-action-cell" role="cell">
                        <button
                          type="button"
                          className="project-list-page__project-action"
                          onClick={() => onOpenProject(item)}
                        >
                          {actionLabel}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
