'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../../../../lib/supabase';
import { useAuth } from '../../../../../../providers';
import ProposalOpeningPages from '../../../../../../../components/ProposalOpeningPages';
import ProposalCapabilitiesPages from '../../../../../../../components/ProposalCapabilitiesPages';

const EMPTY_PROFILE = {
  contactName: '',
  phone: '',
  email: '',
  address: '',
  logoUrl: '',
  about: '',
};

const PROFILE_FIELDS = [
  ['contactName', 'Partner contact person', 'text'],
  ['phone', 'Partner phone number', 'tel'],
  ['email', 'Partner contact email', 'email'],
  ['logoUrl', 'Partner logo image URL — optional', 'url'],
];

const SERVICE_FIELDS = [
  ['approvals', 'Permissions & approvals'],
  ['siteAudit', 'Site audit'],
  ['design', 'System design'],
  ['agreement', 'Agreement & documentation'],
  ['finance', 'Financial assistance'],
  ['quality', 'Product quality'],
  ['safety', 'Safety & insurance'],
  ['maintenance', 'Annual maintenance'],
  ['commissioning', 'Plant commissioning'],
];

const COVERAGE_OPTIONS = [
  'Not specified',
  'Included',
  'Optional',
  'Not included',
];

const EMPTY_COVERAGE = {
  approvals: 'Not specified',
  siteAudit: 'Not specified',
  design: 'Not specified',
  agreement: 'Not specified',
  finance: 'Not specified',
  quality: 'Not specified',
  safety: 'Not specified',
  maintenance: 'Not specified',
  commissioning: 'Not specified',
};

const EMPTY_PRODUCT_TEXT = {
  modules: '',
  inverters: '',
  structures: '',
};

function linesToOptions(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function ProposalPrintPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const proposalId = params?.proposalId;

  const { user, loading } = useAuth();
  const userId = user?.id;

  const base = `/vendor/crm/${workspaceId}`;

  const loadKey =
    `${userId || ''}:${workspaceId || ''}:${proposalId || ''}`;

  const [record, setRecord] = useState(null);
  const [loadedFor, setLoadedFor] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const [partnerProfile, setPartnerProfile] = useState({
    ...EMPTY_PROFILE,
  });

  const [solarHuesAbout, setSolarHuesAbout] = useState('');

  const [serviceCoverage, setServiceCoverage] = useState({
    ...EMPTY_COVERAGE,
  });

  const [productText, setProductText] = useState({
    ...EMPTY_PRODUCT_TEXT,
  });

  const [reviewed, setReviewed] = useState(false);
  const [printError, setPrintError] = useState('');

  useEffect(() => {
    let active = true;

    setRecord(null);
    setLoadedFor('');
    setError('');

    setPartnerProfile({ ...EMPTY_PROFILE });
    setSolarHuesAbout('');
    setServiceCoverage({ ...EMPTY_COVERAGE });
    setProductText({ ...EMPTY_PRODUCT_TEXT });

    setReviewed(false);
    setPrintError('');

    if (loading || !userId || !workspaceId || !proposalId) {
      return () => {
        active = false;
      };
    }

    async function loadDocument() {
      try {
        const [
          companyResult,
          memberResult,
          profileResult,
        ] = await Promise.all([
          supabase
            .from('crm_workspaces')
            .select(`
              id,
              company_name,
              status,
              access_expires_at
            `)
            .eq('id', workspaceId)
            .maybeSingle(),

          supabase
            .from('crm_workspace_members')
            .select('member_role, is_active')
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId)
            .maybeSingle(),

          supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle(),
        ]);

        const accessQueryError =
          companyResult.error ||
          memberResult.error ||
          profileResult.error;

        if (accessQueryError) throw accessQueryError;

        const company = companyResult.data;
        const member = memberResult.data;
        const isAdmin = profileResult.data?.role === 'admin';

        const workspaceAvailable =
          company &&
          company.status === 'active' &&
          (
            !company.access_expires_at ||
            new Date(company.access_expires_at).getTime() >
              Date.now()
          );

        if (!workspaceAvailable) {
          throw new Error(
            'Workspace is unavailable, expired, suspended, or inaccessible.'
          );
        }

        const memberAllowed =
          member?.is_active &&
          ['owner', 'sales'].includes(member.member_role);

        if (!isAdmin && !memberAllowed) {
          throw new Error(
            'Only workspace owners, sales staff and SolarHues ' +
            'admins can prepare customer proposals on this page.'
          );
        }

        if (!active) return;

        const {
          data: proposal,
          error: proposalError,
        } = await supabase
          .from('crm_proposals')
          .select(`
            id,
            workspace_id,
            lead_id,
            proposal_number,
            status,
            system_capacity_kwp,
            valid_until,
            created_at
          `)
          .eq('id', proposalId)
          .eq('workspace_id', workspaceId)
          .maybeSingle();

        if (proposalError) {
          throw new Error(`Proposal: ${proposalError.message}`);
        }

        if (!proposal) {
          throw new Error(
            'Proposal not found in this workspace, or your ' +
            'account does not have permission to read it.'
          );
        }

        if (!active) return;

        const {
          data: lead,
          error: leadError,
        } = await supabase
          .from('crm_leads')
          .select(`
            id,
            customer_name,
            locality,
            city,
            state,
            pincode
          `)
          .eq('id', proposal.lead_id)
          .eq('workspace_id', workspaceId)
          .maybeSingle();

        if (leadError) {
          throw new Error(`Customer: ${leadError.message}`);
        }

        if (!lead) {
          throw new Error(
            'Customer details are unavailable. Review lead ' +
            'access before preparing this document.'
          );
        }

        if (!active) return;

        setRecord({
          company,
          proposal,
          lead,
        });
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Could not prepare this proposal.'
          );
        }
      } finally {
        if (active) setLoadedFor(loadKey);
      }
