import { appPlatformTypes, platformContext, onLineContext } from '@remix-ui/app';
import React, { useContext } from 'react' // eslint-disable-line
import { Dropdown } from 'react-bootstrap';
import { CompilerMenu, CompilerMenuToggle } from './compiler-menu';

export type compilerVersion = {
  path: string,
  longVersion: string,
  isDownloaded: boolean
}

interface compilerDropdownProps {
  customVersions: string[],
  selectedVersion: string,
  defaultVersion: string,
  allversions: compilerVersion[],
  handleLoadVersion: (url: string) => void,
  _shouldBeAdded: (version: string) => boolean,
  onlyDownloaded: boolean
}

const isVersionLessThan = (v: string, target: string) => {
  try {
    const clean = (ver: string) => ver.replace(/^v/, '').split('+')[0].split('.').map(Number);
    const [v1, v2, v3] = clean(v);
    const [t1, t2, t3] = clean(target);
    if (v1 !== t1) return v1 < t1;
    if (v2 !== t2) return v2 < t2;
    return v3 < t3;
  } catch (e) {
    return false;
  }
}

export const CompilerDropdown = (props: compilerDropdownProps) => {
  const online = useContext(onLineContext)
  const platform = useContext(platformContext)
  let { customVersions, selectedVersion, defaultVersion, allversions, handleLoadVersion, _shouldBeAdded, onlyDownloaded } = props

  // Force default version if none is selected
  if (!selectedVersion && defaultVersion) {
    selectedVersion = defaultVersion
  }

  // Filter only versions less than 0.8.11
  const filteredVersions = allversions.filter(build => isVersionLessThan(build.longVersion, '0.8.12'))

  return (
    <Dropdown id="versionSelector" data-id="versionSelector">
      <Dropdown.Toggle as={CompilerMenuToggle} id="dropdown-custom-components" className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control" icon={null}>
        <div style={{ flexGrow: 1, overflow: 'hidden', display:'flex', justifyContent:'left' }}>
          <div className="text-truncate">
            {customVersions.map((url, i) => {
              if (selectedVersion === url) return (<span data-id="selectedVersion" key={i}>custom</span>)
            })}
            {filteredVersions.map((build, i) => {
              if (selectedVersion === build.path) {
                return (<span data-id="selectedVersion" key={i}>{build.longVersion}</span>)
              }
            })}
          </div>
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu as={CompilerMenu} className="w-100 custom-dropdown-items overflow-hidden" data-id="custom-dropdown-items">
        {filteredVersions.length <= 0 && (
          <>
            <Dropdown.Item
              key={`default`}
              data-id='builtin'
              onClick={() => {}}
            >
              <div className='d-flex w-100 justify-content-between'>
                {selectedVersion === defaultVersion ? <span className='fas fa-check text-success mr-2'></span> : null}
                <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                  <div className="text-truncate">{defaultVersion}</div>
                </div>
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key={`builtin`}
              data-id='builtin'
              onClick={() => {}}
            >
              <div className='d-flex w-100 justify-content-between'>
                {selectedVersion === "builtin" ? <span className='fas fa-check text-success mr-2'></span> : null}
                <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                  <div className="text-truncate">builtin</div>
                </div>
              </div>
            </Dropdown.Item>
          </>
        )}
        {customVersions.map((url, i) => (
          <Dropdown.Item
            key={`custom-${i}`}
            data-id={`dropdown-item-${url}`}
            onClick={() => handleLoadVersion(url)}
          >
            <div className='d-flex w-100 justify-content-between'>
              {selectedVersion === url ? <span className='fas fa-check text-success mr-2'></span> : null}
              <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                <div className="text-truncate">custom: {url}</div>
              </div>
            </div>
          </Dropdown.Item>
        ))}
        {filteredVersions.map((build, i) => {
          if (onlyDownloaded && !build.isDownloaded) return null
          return _shouldBeAdded(build.longVersion) ? (
            <Dropdown.Item
              key={`soljson-${i}`}
              data-id={`dropdown-item-${build.path}`}
              onClick={() => handleLoadVersion(build.path)}
            >
              <div className='d-flex w-100 justify-content-between'>
                {selectedVersion === build.path ? <span className='fas fa-check text-success mr-2'></span> : null}
                <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                  <div className="text-truncate">{build.longVersion}</div>
                </div>
                {platform === appPlatformTypes.desktop ? (
                  build.isDownloaded ? <div className='fas fa-arrow-circle-down text-success ml-auto'></div>
                  : <div className='far fa-arrow-circle-down'></div>
                ) : null}
              </div>
            </Dropdown.Item>
          ) : null
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}
