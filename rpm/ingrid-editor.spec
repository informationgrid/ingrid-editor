Name:                       ingrid-editor
Version:                    0.0.0
Release:                    dev
Summary:                    InGrid Editor
Group:                      Applications/Internet
License:                    Proprietary
URL:                        https://www.wemove.com/
BuildArch:                  noarch
AutoReqProv:                no
Requires:                   jre >= 25

%define target              %{buildroot}/opt/ingrid/ingrid-editor
%define systemd_dir         /usr/lib/systemd/system
%define ingrid_unit_name    ingrid-editor.service
%define ingrid_service      %{systemd_dir}/%{ingrid_unit_name}

%description
InGrid Editor

%prep

%build
# nothing to do

%install
rm -Rf %{buildroot}*

mkdir -p %{target}
unzip -qq "${WORKSPACE}/build/distributions/ingrid-editor-[0-9]*.zip"
mv ./ingrid-editor-*/* %{target}

# Copy over the systemd unit file
mkdir -p %{buildroot}%{systemd_dir}
cp ${WORKSPACE}/rpm/%{ingrid_unit_name} %{buildroot}%{systemd_dir}

%files
%defattr(0644,ingrid,ingrid,0755)
%attr(0755,ingrid,ingrid) /opt/ingrid/ingrid-editor
%attr(0644,root,root) %{ingrid_service}

################################################################################
%pre
# Scriptlet that is executed just before the package is installed on the target
# system.
if [ -f "/etc/systemd/system/ingrid-editor.service" ]; then
  service ingrid-editor stop
fi

################################################################################
%preun
if [ -f "/etc/systemd/system/ingrid-editor.service" ]; then
  service ingrid-editor stop
fi

################################################################################
%postun


%changelog
